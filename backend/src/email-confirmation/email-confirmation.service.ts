import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import VerificationTokenPayload from './verificationTokenPayload.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { from, Observable } from 'rxjs';
import { SentMessageInfo } from "nodemailer"
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { join } from 'path';


@Injectable()
export class EmailConfirmationService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly emailService: MailerService
	) { }

	public sendVerificationLink(email: string): Observable<SentMessageInfo> {
		const payload: VerificationTokenPayload = { email };

		const token = this.jwtService.sign(payload, {
			secret: this.configService.get('EMAIL_VERIFICATION_TOKEN_SECRET'),
			algorithm: 'HS256',
			expiresIn: this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME')
		});

		const confirmationUrl = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`

		return from(this.emailService.sendMail({
			to: email,
			subject: 'Anmeldung HTBLA Saalfelden',
			template: 'email-confirmation',
			context: {
				confirmationUrl
			},
			attachments: [{
				filename: 'mint_guetesiegel.png',
				path: join(__dirname, '../../assets/images/mint_guetesiegel.png'),
				cid: 'ee41a8ed-bbb8-4612-b7f5-064e89621d9f'
			}]
		}))
	}

	public sendInvitationLink(email: string): Promise<SentMessageInfo> {
		const payload: VerificationTokenPayload = { email, purpose: 'invite' };
		const expiresIn = this.configService.get('INVITATION_TOKEN_EXPIRATION_TIME') ?? '14d'

		const token = this.jwtService.sign(payload, {
			secret: this.configService.get('EMAIL_VERIFICATION_TOKEN_SECRET'),
			algorithm: 'HS256',
			expiresIn
		});

		return this.emailService.sendMail({
			to: email,
			subject: 'Einladung HTBLA Saalfelden',
			template: 'invitation',
			context: {
				invitationUrl: `${this.getFrontendUrl()}/set-password?token=${token}`,
				validity: /^\d+d$/.test(expiresIn) ? `${parseInt(expiresIn)} Tage` : expiresIn
			},
			attachments: [{
				filename: 'mint_guetesiegel.png',
				path: join(__dirname, '../../assets/images/mint_guetesiegel.png'),
				cid: 'ee41a8ed-bbb8-4612-b7f5-064e89621d9f'
			}]
		})
	}

	public decodeInvitationToken(token: string): Promise<string> {
		return this.decodeConfirmationToken(token, 'invite')
	}

	// The frontend is served from the same origin as the confirmation page
	public getFrontendUrl(): string {
		return new URL(this.configService.get('EMAIL_CONFIRMATION_URL')).origin
	}

	public async decodeConfirmationToken(token: string, purpose?: VerificationTokenPayload['purpose']): Promise<string> {
		try {
			const payload = await this.jwtService.verify(token, {
				secret: this.configService.get('EMAIL_VERIFICATION_TOKEN_SECRET'),
			});
			if (typeof payload === 'object' && 'email' in payload && (!purpose || payload.purpose === purpose)) {
				return payload.email;
			}
			throw new BadRequestException();
		} catch (error) {
			console.error(error)
			if (error?.name === 'TokenExpiredError') {
				throw new ApiError(ApiErrorType.CONFIRMATION_TOKEN_EXPIRED);
			}
			throw new ApiError(ApiErrorType.BAD_CONFIRMATION_TOKEN);
		}
	}
}