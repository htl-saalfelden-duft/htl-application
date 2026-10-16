import { Injectable } from '@nestjs/common';
import { Contact, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { SettingService } from 'src/setting/setting.service';

const NOT_ANONYMIZED: Prisma.ApplicantWhereInput = {
	statusKey: { not: 'created' },
	anonymizedAt: { isSet: false }
};

// Contact fields kept for statistics (SPEC 4.10): place of residence and flags
const KEPT_CONTACT_FIELDS = [
	'contactTypeKey', 'country', 'zip', 'city',
	'legalGardian', 'liableToPay', 'decitionTo', 'postTo', 'pupilInBoardingSchool', 'primaryResidenz'
] as const;

export interface ClosePhaseCounts {
	applicantsToDelete: number
	applicantsToAnonymize: number
	trialDayRegistrations: number
	upcomingTrialDayRegistrations: number
	trialDays: number
}

@Injectable()
export class ApplicationPhaseService {
	constructor(
		private prisma: PrismaService,
		private readonly settingService: SettingService
	) { }

	async preview(): Promise<ClosePhaseCounts> {
		const [applicantsToDelete, applicantsToAnonymize, trialDayRegistrations, upcomingTrialDayRegistrations, trialDays] = await Promise.all([
			this.prisma.applicant.count({ where: { statusKey: 'created' } }),
			this.prisma.applicant.count({ where: NOT_ANONYMIZED }),
			this.prisma.trialDayRegistration.count(),
			this.prisma.trialDayRegistration.count({
				where: { statusKey: { in: ['registered', 'waiting'] }, trialDay: { startAt: { gt: new Date() } } }
			}),
			this.prisma.trialDay.count()
		])
		return { applicantsToDelete, applicantsToAnonymize, trialDayRegistrations, upcomingTrialDayRegistrations, trialDays }
	}

	// Irreversible. Each step is idempotent, so running it again after an abort is safe.
	async close(): Promise<ClosePhaseCounts> {
		const counts = await this.preview()

		await this.settingService.setApplicationOpen(false)

		await this.prisma.trialDayRegistration.deleteMany()
		await this.prisma.trialDay.deleteMany()

		await this.prisma.application.deleteMany({ where: { applicant: { statusKey: 'created' } } })
		await this.prisma.applicant.deleteMany({ where: { statusKey: 'created' } })

		const applicants = await this.prisma.applicant.findMany({
			where: NOT_ANONYMIZED,
			select: { id: true, details: true, contacts: true }
		})
		const anonymizedAt = new Date()
		for (const applicant of applicants) {
			await this.prisma.applicant.update({
				where: { id: applicant.id },
				data: {
					// email is unique, so it gets a placeholder; this also disables the login
					email: `anonymisiert-${applicant.id}@invalid.local`,
					passwordHash: null,
					annotation: null,
					anonymizedAt,
					details: applicant.details ? {
						set: {
							...applicant.details,
							firstname: null,
							moreFirstname: null,
							lastname: null,
							birthdate: null,
							svnr: null,
							svInstitution: null,
							placeOfBirth: null,
							religion: null,
							annotation: null
						}
					} : undefined,
					contacts: { set: applicant.contacts.map(anonymizeContact) }
				}
			})
		}

		return counts
	}
}

const anonymizeContact = (contact: Contact): Prisma.ContactCreateInput => {
	const kept = { contactTypeKey: contact.contactTypeKey } as Prisma.ContactCreateInput
	for (const field of KEPT_CONTACT_FIELDS) {
		(kept as any)[field] = contact[field]
	}
	return kept
}
