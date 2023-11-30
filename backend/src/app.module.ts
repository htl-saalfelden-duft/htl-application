import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApplicantModule } from './applicant/applicant.module';
import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailConfig } from './config/mail.config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot(mailConfig),
    AuthModule,
    UserModule,
    EmailConfirmationModule,
    ApplicantModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [],
  exports:[]
})
export class AppModule {}
