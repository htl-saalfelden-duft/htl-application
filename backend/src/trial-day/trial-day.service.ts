import { Injectable } from '@nestjs/common';
import { Prisma, TrialDay } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { TrialDayRegistrationService } from './trial-day-registration.service';
import { TrialDayMailService } from './trial-day-mail.service';
import { optionalText } from './trial-day.utils';

export type TrialDayDto = Partial<Pick<TrialDay,
	'schoolClassID' | 'startAt' | 'endAt' | 'maxParticipants' | 'registrationDeadline' | 'description' | 'active'>>;

@Injectable()
export class TrialDayService {
	constructor(
		private prisma: PrismaService,
		private readonly registrationService: TrialDayRegistrationService,
		private readonly mailService: TrialDayMailService
	) { }

	// Applicants only see active, upcoming trial days; the administration sees all
	// upcoming ones, or also past ones with `past`.
	async getMany(params: { forApplicant: boolean, schoolClassID?: string, past?: boolean }) {
		const now = new Date()
		const where: Prisma.TrialDayWhereInput = {}

		if (params.forApplicant) {
			where.active = true
			where.startAt = { gt: now }
		} else if (!params.past) {
			where.endAt = { gte: now }
		}
		if (params.schoolClassID) {
			where.schoolClassID = params.schoolClassID
		}

		const trialDays = await this.prisma.trialDay.findMany({
			where,
			include: { schoolClass: true, registrations: { select: { statusKey: true } } },
			orderBy: { startAt: 'asc' }
		})

		return trialDays.map(({ registrations, ...trialDay }) => ({
			...trialDay,
			registeredCount: registrations.filter(r => r.statusKey === 'registered').length,
			waitingCount: registrations.filter(r => r.statusKey === 'waiting').length,
			bookable: trialDay.active && now < trialDay.registrationDeadline && now < trialDay.startAt
		}))
	}

	async getPublic() {
		const trialDays = await this.getMany({ forApplicant: true })
		return trialDays.map(trialDay => ({
			id: trialDay.id,
			schoolClassID: trialDay.schoolClassID,
			schoolClass: { id: trialDay.schoolClass.id, title: trialDay.schoolClass.title },
			startAt: trialDay.startAt,
			endAt: trialDay.endAt,
			registrationDeadline: trialDay.registrationDeadline,
			description: trialDay.description,
			maxParticipants: trialDay.maxParticipants,
			registeredCount: trialDay.registeredCount,
			waitingCount: trialDay.waitingCount,
			bookable: trialDay.bookable
		}))
	}

	async create(dto: TrialDayDto): Promise<TrialDay> {
		const data = await this.validate(dto)
		return this.prisma.trialDay.create({ data: data as Prisma.TrialDayUncheckedCreateInput })
	}

	async update(id: string, dto: TrialDayDto): Promise<TrialDay> {
		const previous = await this.prisma.trialDay.findUnique({ where: { id } })
		if (!previous) {
			throw new ApiError(ApiErrorType.NOT_FOUND)
		}
		const data = await this.validate(dto, previous)

		const { trialDay, promoted } = await this.registrationService.withTrialDayLock([id], async tx => {
			const registrations = await tx.trialDayRegistration.findMany({ where: { trialDayID: id }, select: { statusKey: true } })
			const registeredCount = registrations.filter(r => r.statusKey === 'registered').length

			if (data.schoolClassID !== previous.schoolClassID && registrations.length) {
				throw new ApiError(ApiErrorType.INVALID_INPUT)
			}
			// An overbooked trial day may keep its maximum, but it must not be lowered further
			if (data.maxParticipants < registeredCount && data.maxParticipants !== previous.maxParticipants) {
				throw new ApiError(ApiErrorType.TRIAL_DAY_MAX_BELOW_REGISTERED)
			}

			const trialDay = await tx.trialDay.update({ where: { id }, data })
			const promoted = await this.registrationService.promoteWaitingList(tx, id)
			return { trialDay, promoted }
		})

		for (const registrationID of promoted) {
			await this.mailService.sendPromotion(registrationID)
		}
		return trialDay
	}

	async delete(id: string): Promise<TrialDay> {
		if (await this.prisma.trialDayRegistration.count({ where: { trialDayID: id } })) {
			throw new ApiError(ApiErrorType.TRIAL_DAY_HAS_REGISTRATIONS)
		}
		return this.prisma.trialDay.delete({ where: { id } })
			.catch(error => {
				throw new ApiError(error)
			})
	}

	// Merges dto into previous (on update) and checks the result
	private async validate(dto: TrialDayDto, previous?: TrialDay) {
		const data = {
			schoolClassID: dto.schoolClassID ?? previous?.schoolClassID,
			startAt: toDate(dto.startAt ?? previous?.startAt),
			endAt: toDate(dto.endAt ?? previous?.endAt),
			registrationDeadline: toDate(dto.registrationDeadline ?? previous?.registrationDeadline),
			maxParticipants: dto.maxParticipants ?? previous?.maxParticipants,
			description: dto.description !== undefined ? optionalText(dto.description) : previous?.description ?? null,
			active: dto.active ?? previous?.active ?? false
		}

		if (!Number.isInteger(data.maxParticipants) || data.maxParticipants < 1
			|| typeof data.active !== 'boolean'
			|| data.startAt >= data.endAt
			|| data.registrationDeadline > data.startAt) {
			throw new ApiError(ApiErrorType.INVALID_INPUT)
		}

		if (data.schoolClassID !== previous?.schoolClassID) {
			const schoolClass = typeof data.schoolClassID === 'string' && /^[0-9a-f]{24}$/.test(data.schoolClassID)
				? await this.prisma.schoolClass.findUnique({ where: { id: data.schoolClassID } })
				: null
			if (!schoolClass?.active) {
				throw new ApiError(ApiErrorType.INVALID_INPUT)
			}
		}

		return data
	}
}

const toDate = (value: Date | string | undefined): Date => {
	const date = value ? new Date(value) : undefined
	if (!date || isNaN(date.getTime())) {
		throw new ApiError(ApiErrorType.INVALID_INPUT)
	}
	return date
}
