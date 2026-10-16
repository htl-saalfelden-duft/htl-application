import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { PrismaService } from 'src/prisma.service';
import { EmailConfirmationService } from 'src/email-confirmation/email-confirmation.service';
import { waitingPosition } from './trial-day.utils';

const TIME_ZONE = 'Europe/Vienna';

// Mails to applicants about their trial day registrations. A failing mail is
// only logged and never rolls back the booking.
@Injectable()
export class TrialDayMailService {
	constructor(
		private prisma: PrismaService,
		private readonly emailService: MailerService,
		private readonly emailConfirmationService: EmailConfirmationService
	) { }

	async sendRegistration(registrationID: string, rebookedFrom?: { startAt: Date }) {
		const context = await this.getContext(registrationID)
		if (!context) return

		await this.send(context.to, 'Anmeldung zum Schnuppertag', 'trial-registration', {
			...context.values,
			waitingPosition: context.waitingPosition,
			rebookedFrom: rebookedFrom ? formatDate(rebookedFrom.startAt) : null
		})
	}

	async sendCancellation(registrationID: string) {
		const context = await this.getContext(registrationID)
		if (!context) return

		await this.send(context.to, 'Stornierung des Schnuppertags', 'trial-cancellation', {
			...context.values,
			byAdministration: context.cancelledBy === 'administration'
		})
	}

	async sendPromotion(registrationID: string) {
		const context = await this.getContext(registrationID)
		if (!context) return

		await this.send(context.to, 'Platz beim Schnuppertag frei geworden', 'trial-promotion', context.values)
	}

	private async getContext(registrationID: string) {
		const registration = await this.prisma.trialDayRegistration.findUnique({
			where: { id: registrationID },
			include: {
				trialDay: { include: { schoolClass: true, registrations: { where: { statusKey: 'waiting' } } } },
				applicant: { select: { email: true, details: true } }
			}
		})
		if (!registration) return

		const { trialDay, applicant } = registration

		return {
			to: applicant.email,
			cancelledBy: registration.cancelledBy,
			waitingPosition: waitingPosition(registration, trialDay.registrations),
			// Handlebars runs in strict mode: every key used in a template must be present
			values: {
				firstname: applicant.details?.firstname ?? '',
				lastname: applicant.details?.lastname ?? '',
				schoolClass: trialDay.schoolClass.title,
				date: formatDate(trialDay.startAt),
				timeFrom: formatTime(trialDay.startAt),
				timeTo: formatTime(trialDay.endAt),
				deadline: `${formatDate(trialDay.registrationDeadline)}, ${formatTime(trialDay.registrationDeadline)} Uhr`,
				description: trialDay.description ?? null,
				trialDaysUrl: `${this.emailConfirmationService.getFrontendUrl()}/trial-days`
			}
		}
	}

	private send(to: string, subject: string, template: string, context: object) {
		return this.emailService.sendMail({
			to,
			subject,
			template,
			context,
			attachments: [{
				filename: 'mint_guetesiegel.png',
				path: join(__dirname, '../../assets/images/mint_guetesiegel.png'),
				cid: 'ee41a8ed-bbb8-4612-b7f5-064e89621d9f'
			}]
		})
			.catch((err) => {
				console.error(err)
				return
			})
	}
}

const formatDate = (date: Date) =>
	date.toLocaleDateString('de-AT', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const formatTime = (date: Date) =>
	date.toLocaleTimeString('de-AT', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' })
