import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import VerificationTokenPayload from './verificationTokenPayload.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { from, Observable } from 'rxjs';
import { SentMessageInfo } from "nodemailer"
import { ApiError, ApiErrorType } from 'src/common/api-error';

 
@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: MailerService
  ) {}
 
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
      subject: 'Email-Bestätigung Anmeldung HTL-Saalfelden',
      template: 'email-confirmation',
      context: {
        confirmationUrl
      }
    }))
  }

  public async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('EMAIL_VERIFICATION_TOKEN_SECRET'),
      });
      if (typeof payload === 'object' && 'email' in payload) {
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