import { Injectable } from '@nestjs/common';
import { Prisma, TrialDay, TrialDayRegistration } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { JwtTokenPayload } from 'src/auth/jwt-token-payload.model';
import { EmailConfirmationService } from 'src/email-confirmation/email-confirmation.service';
import { TrialDayMailService } from './trial-day-mail.service';
import { ACTIVE_STATUS_KEYS, optionalBoolean, optionalText, requireText, waitingPosition, withSchoolClasses } from './trial-day.utils';

type Tx = Prisma.TransactionClient;

const GUARDIAN_CONTACT_TYPES = ['mother', 'father', 'others'];

// Required for every registration (SPEC 4.1), except class, extra answer and annotation
interface RegistrationData {
	currentClass?: string
	street: string
	streetNr: string
	zip: string
	city: string
	guardianContactTypeKey: string
	guardianFirstname: string
	guardianLastname: string
	guardianPhone: string
	guardianEmail: string
	photoConsent: boolean
	extraAnswer?: boolean
	annotation?: string
}

interface PersonData {
	firstname?: string
	lastname?: string
	school?: string
}

export interface ApplicantRegistrationDto extends RegistrationData, PersonData {
	trialDayID: string
	dsgvo?: boolean
}

export interface AdministrationRegistrationDto extends RegistrationData, PersonData {
	applicantID?: string
	email?: string
	overbook?: boolean
}

const MAX_ATTEMPTS = 5;

@Injectable()
export class TrialDayRegistrationService {
	constructor(
		private prisma: PrismaService,
		private readonly mailService: TrialDayMailService,
		private readonly emailConfirmationService: EmailConfirmationService
	) { }

	// Runs fn in a transaction that first writes the given trial days. MongoDB only detects
	// write-write conflicts on the same document, so this makes concurrent bookings of the
	// same trial day conflict (P2034); they are retried.
	async withTrialDayLock<T>(trialDayIDs: string[], fn: (tx: Tx) => Promise<T>): Promise<T> {
		for (let attempt = 1; ; attempt++) {
			try {
				return await this.prisma.$transaction(async tx => {
					for (const id of trialDayIDs) {
						await tx.trialDay.update({ where: { id }, data: { updatedAt: new Date() } })
					}
					return fn(tx)
				})
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					if (error.code === 'P2034') {
						if (attempt < MAX_ATTEMPTS) {
							await new Promise(resolve => setTimeout(resolve, Math.random() * 50 * attempt))
							continue
						}
						throw new ApiError(ApiErrorType.CONCURRENT_UPDATE)
					}
					if (error.code === 'P2025') {
						throw new ApiError(ApiErrorType.NOT_FOUND)
					}
				}
				throw error
			}
		}
	}

	async getMine(applicantID: string) {
		const registrations = await this.prisma.trialDayRegistration.findMany({
			where: { applicantID },
			include: {
				trialDay: {
					include: {
						registrations: { where: { statusKey: 'waiting' }, select: { id: true, createdAt: true, statusKey: true } }
					}
				}
			},
			orderBy: { trialDay: { startAt: 'asc' } }
		})
		const trialDays = await withSchoolClasses(this.prisma, registrations.map(registration => registration.trialDay))
		const now = new Date()

		return registrations.map(({ trialDay: _, ...registration }, index) => {
			const { registrations: waiting, ...trialDay } = trialDays[index]
			return {
				...registration,
				trialDay,
				waitingPosition: waitingPosition(registration, waiting),
				changeable: ACTIVE_STATUS_KEYS.includes(registration.statusKey) && now < trialDay.registrationDeadline
			}
		})
	}

	async getForTrialDay(trialDayID: string) {
		const registrations = await this.prisma.trialDayRegistration.findMany({
			where: { trialDayID },
			include: { applicant: { select: { id: true, email: true, details: true, passwordHash: true } } },
			orderBy: { createdAt: 'asc' }
		})

		return registrations.map(({ applicant: { passwordHash, ...applicant }, ...registration }) => ({
			...registration,
			applicant: { ...applicant, invitationPending: !passwordHash },
			waitingPosition: waitingPosition(registration, registrations)
		}))
	}

	async registerByApplicant(applicantID: string, dto: ApplicantRegistrationDto) {
		requireText(dto.trialDayID, dto.firstname, dto.lastname, dto.school, dto.guardianPhone)

		const applicant = await this.prisma.applicant.findUnique({ where: { id: applicantID } })
		if (!applicant.dsgvo && dto.dsgvo !== true) {
			throw new ApiError(ApiErrorType.DSGVO_REQUIRED)
		}

		const registration = await this.withTrialDayLock([dto.trialDayID], async tx => {
			const trialDay = await tx.trialDay.findUnique({ where: { id: dto.trialDayID } })
			const now = new Date()
			if (!trialDay.active || trialDay.startAt <= now) {
				throw new ApiError(ApiErrorType.TRIAL_DAY_NOT_BOOKABLE)
			}
			if (now >= trialDay.registrationDeadline) {
				throw new ApiError(ApiErrorType.TRIAL_DAY_DEADLINE_PASSED)
			}

			const data = registrationData(dto, trialDay)
			await this.updatePerson(tx, applicantID, dto, data, true)
			return this.create(tx, trialDay, applicantID, data, 'applicant', false)
		})

		await this.mailService.sendRegistration(registration.id)
		return registration
	}

	// Registration by the administration, e.g. after a phone call (SPEC 4.5). Ignores the
	// deadline; creates an account without password and sends an invitation if needed.
	async registerByAdministration(trialDayID: string, dto: AdministrationRegistrationDto) {
		if (!dto.applicantID) {
			requireText(dto.email, dto.firstname, dto.lastname, dto.school)
		}

		const trialDay = await this.prisma.trialDay.findUnique({ where: { id: trialDayID } })
		if (!trialDay) {
			throw new ApiError(ApiErrorType.NOT_FOUND)
		}
		// Validate before an account gets created
		const data = registrationData(dto, trialDay)

		let applicantID = dto.applicantID
		let invite = false
		if (applicantID) {
			if (!await this.prisma.applicant.findUnique({ where: { id: applicantID } })) {
				throw new ApiError(ApiErrorType.NOT_FOUND)
			}
		} else {
			const email = dto.email.trim()
			const existing = await this.prisma.applicant.findUnique({ where: { email } })
			if (existing) {
				applicantID = existing.id
			} else {
				const created = await this.prisma.applicant.create({ data: { email } })
				applicantID = created.id
				invite = true
			}
		}

		const registration = await this.withTrialDayLock([trialDayID], async tx => {
			await this.updatePerson(tx, applicantID, dto, data, false)
			return this.create(tx, trialDay, applicantID, data, 'administration', dto.overbook === true)
		})

		if (invite) {
			await this.emailConfirmationService.sendInvitationLink(dto.email.trim()).catch(err => console.error(err))
		}
		await this.mailService.sendRegistration(registration.id)
		return registration
	}

	async cancel(registrationID: string, user: JwtTokenPayload) {
		const byApplicant = user.userType === 'applicant'
		const registration = await this.getOwnRegistration(registrationID, user)

		if (!ACTIVE_STATUS_KEYS.includes(registration.statusKey)) {
			return registration
		}
		if (byApplicant && new Date() >= registration.trialDay.registrationDeadline) {
			throw new ApiError(ApiErrorType.TRIAL_DAY_DEADLINE_PASSED)
		}

		const { cancelled, promoted } = await this.withTrialDayLock([registration.trialDayID], async tx => {
			const current = await tx.trialDayRegistration.findUnique({ where: { id: registrationID } })
			const cancelled = await tx.trialDayRegistration.update({
				where: { id: registrationID },
				data: { statusKey: 'cancelled', cancelledAt: new Date(), cancelledBy: byApplicant ? 'applicant' : 'administration' }
			})
			const promoted = current.statusKey === 'registered' ? await this.promoteWaitingList(tx, registration.trialDayID) : []
			return { cancelled, promoted }
		})

		await this.mailService.sendCancellation(registrationID)
		await this.sendPromotions(promoted)
		return cancelled
	}

	async rebook(registrationID: string, trialDayID: string, user: JwtTokenPayload) {
		requireText(trialDayID)
		const registration = await this.getOwnRegistration(registrationID, user)
		const now = new Date()

		if (!ACTIVE_STATUS_KEYS.includes(registration.statusKey) || trialDayID === registration.trialDayID) {
			throw new ApiError(ApiErrorType.TRIAL_DAY_NOT_BOOKABLE)
		}
		if (now >= registration.trialDay.registrationDeadline) {
			throw new ApiError(ApiErrorType.TRIAL_DAY_DEADLINE_PASSED)
		}

		const { created, promoted } = await this.withTrialDayLock([registration.trialDayID, trialDayID], async tx => {
			const target = await tx.trialDay.findUnique({ where: { id: trialDayID } })
			const sharesDepartment = target.schoolClassIDs.some(id => registration.trialDay.schoolClassIDs.includes(id))
			if (!target.active || target.startAt <= now || !sharesDepartment) {
				throw new ApiError(ApiErrorType.TRIAL_DAY_NOT_BOOKABLE)
			}
			if (now >= target.registrationDeadline) {
				throw new ApiError(ApiErrorType.TRIAL_DAY_DEADLINE_PASSED)
			}

			const current = await tx.trialDayRegistration.findUnique({ where: { id: registrationID } })
			if (!ACTIVE_STATUS_KEYS.includes(current.statusKey)) {
				throw new ApiError(ApiErrorType.TRIAL_DAY_NOT_BOOKABLE)
			}
			await tx.trialDayRegistration.update({
				where: { id: registrationID },
				data: { statusKey: 'cancelled', cancelledAt: now, cancelledBy: 'applicant' }
			})
			// The answer only carries over if the new trial day asks the same question
			const created = await this.create(tx, target, current.applicantID, {
				...pickRegistrationData(current),
				extraAnswer: target.extraQuestion && target.extraQuestion === registration.trialDay.extraQuestion ? current.extraAnswer : null
			}, current.createdBy, false)
			const promoted = current.statusKey === 'registered' ? await this.promoteWaitingList(tx, registration.trialDayID) : []
			return { created, promoted }
		})

		await this.mailService.sendRegistration(created.id, registration.trialDay)
		await this.sendPromotions(promoted)
		return created
	}

	// Fills free places from the waiting list, e.g. after maxParticipants was raised
	async promote(trialDayID: string) {
		const promoted = await this.withTrialDayLock([trialDayID], tx => this.promoteWaitingList(tx, trialDayID))
		await this.sendPromotions(promoted)
	}

	// Moves the oldest waiting registrations up until the trial day is full (SPEC 4.4).
	// Returns the ids of the promoted registrations; mails are sent after the commit.
	async promoteWaitingList(tx: Tx, trialDayID: string): Promise<string[]> {
		const trialDay = await tx.trialDay.findUnique({ where: { id: trialDayID } })
		if (trialDay.startAt <= new Date()) {
			return []
		}

		const registeredCount = await tx.trialDayRegistration.count({ where: { trialDayID, statusKey: 'registered' } })
		const free = trialDay.maxParticipants - registeredCount
		if (free <= 0) {
			return []
		}

		const waiting = await tx.trialDayRegistration.findMany({
			where: { trialDayID, statusKey: 'waiting' },
			orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
			take: free,
			select: { id: true }
		})
		const ids = waiting.map(registration => registration.id)
		if (ids.length) {
			await tx.trialDayRegistration.updateMany({ where: { id: { in: ids } }, data: { statusKey: 'registered' } })
		}
		return ids
	}

	private async create(tx: Tx, trialDay: TrialDay, applicantID: string, data: RegistrationData, createdBy: string, overbook: boolean): Promise<TrialDayRegistration> {
		const existing = await tx.trialDayRegistration.findFirst({
			where: {
				applicantID,
				statusKey: { in: ACTIVE_STATUS_KEYS },
				// Joint trial days: any shared department counts (SPEC 4.11)
				trialDay: { schoolClassIDs: { hasSome: trialDay.schoolClassIDs } }
			}
		})
		if (existing) {
			throw new ApiError(ApiErrorType.TRIAL_DAY_ALREADY_REGISTERED)
		}

		const registeredCount = await tx.trialDayRegistration.count({ where: { trialDayID: trialDay.id, statusKey: 'registered' } })

		return tx.trialDayRegistration.create({
			data: {
				trialDayID: trialDay.id,
				applicantID,
				statusKey: overbook || registeredCount < trialDay.maxParticipants ? 'registered' : 'waiting',
				...data,
				createdBy
			}
		})
	}

	// Name and school are stored in the applicant details so they prefill the application form.
	// Accounts without contacts additionally get the applicant's and the guardian's contact
	// (SPEC 3.2); existing contacts are never overwritten.
	private async updatePerson(tx: Tx, applicantID: string, person: PersonData, registration: RegistrationData, confirmDsgvo: boolean) {
		const details: Prisma.ApplicantDetailsUpdateInput = {}
		if (person.firstname?.trim()) details.firstname = person.firstname.trim()
		if (person.lastname?.trim()) details.lastname = person.lastname.trim()
		if (person.school?.trim()) details.previousSchoolTxt = person.school.trim()

		const data: Prisma.ApplicantUpdateInput = {}
		if (Object.keys(details).length) {
			data.details = { upsert: { set: details as Prisma.ApplicantDetailsCreateInput, update: details } }
		}
		if (confirmDsgvo) {
			data.dsgvo = true
		}

		const applicant = await tx.applicant.findUnique({ where: { id: applicantID }, select: { contacts: true, details: true } })
		if (!applicant.contacts.length) {
			const address = { street: registration.street, streetNr: registration.streetNr, zip: registration.zip, city: registration.city }
			data.contacts = {
				set: [
					{
						contactTypeKey: 'applicant',
						firstname: person.firstname?.trim() || applicant.details?.firstname,
						lastname: person.lastname?.trim() || applicant.details?.lastname,
						...address
					},
					{
						contactTypeKey: registration.guardianContactTypeKey,
						firstname: registration.guardianFirstname,
						lastname: registration.guardianLastname,
						phone: registration.guardianPhone,
						email: registration.guardianEmail,
						legalGardian: true
					}
				]
			}
		}
		if (Object.keys(data).length) {
			await tx.applicant.update({ where: { id: applicantID }, data })
		}
	}

	private async getOwnRegistration(registrationID: string, user: JwtTokenPayload) {
		const registration = await this.prisma.trialDayRegistration.findUnique({
			where: { id: registrationID },
			include: { trialDay: true }
		})
		if (!registration) {
			throw new ApiError(ApiErrorType.NOT_FOUND)
		}
		if (user.userType === 'applicant' && registration.applicantID !== user.id) {
			throw new ApiError(ApiErrorType.FORBIDDEN)
		}
		return registration
	}

	private async sendPromotions(registrationIDs: string[]) {
		for (const id of registrationIDs) {
			await this.mailService.sendPromotion(id)
		}
	}
}

// Validates and normalizes the registration fields of a request
const registrationData = (dto: Partial<RegistrationData>, trialDay: TrialDay): RegistrationData => {
	requireText(dto.street, dto.streetNr, dto.zip, dto.city, dto.guardianFirstname, dto.guardianLastname, dto.guardianPhone, dto.guardianEmail)
	if (!GUARDIAN_CONTACT_TYPES.includes(dto.guardianContactTypeKey) || typeof dto.photoConsent !== 'boolean') {
		throw new ApiError(ApiErrorType.INVALID_INPUT)
	}
	const extraAnswer = optionalBoolean(dto.extraAnswer)
	if (trialDay.extraQuestion && extraAnswer === null) {
		throw new ApiError(ApiErrorType.INVALID_INPUT)
	}

	return {
		currentClass: optionalText(dto.currentClass),
		street: dto.street.trim(),
		streetNr: dto.streetNr.trim(),
		zip: dto.zip.trim(),
		city: dto.city.trim(),
		guardianContactTypeKey: dto.guardianContactTypeKey,
		guardianFirstname: dto.guardianFirstname.trim(),
		guardianLastname: dto.guardianLastname.trim(),
		guardianPhone: dto.guardianPhone.trim(),
		guardianEmail: dto.guardianEmail.trim(),
		photoConsent: dto.photoConsent,
		extraAnswer: trialDay.extraQuestion ? extraAnswer : null,
		annotation: optionalText(dto.annotation)
	}
}

const pickRegistrationData = (registration: TrialDayRegistration): RegistrationData => ({
	currentClass: registration.currentClass,
	street: registration.street,
	streetNr: registration.streetNr,
	zip: registration.zip,
	city: registration.city,
	guardianContactTypeKey: registration.guardianContactTypeKey,
	guardianFirstname: registration.guardianFirstname,
	guardianLastname: registration.guardianLastname,
	guardianPhone: registration.guardianPhone,
	guardianEmail: registration.guardianEmail,
	photoConsent: registration.photoConsent,
	annotation: registration.annotation
})
