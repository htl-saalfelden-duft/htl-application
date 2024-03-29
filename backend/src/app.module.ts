import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApplicantModule } from './applicant/applicant.module';
import { ApplicationModule } from './application/application.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailConfig } from './config/mail.config';
import { LanguageModule } from './language/language.module';
import { ReligionModule } from './religion/religion.module';
import { CountryModule } from './country/country.module';
import { ContactTypeModule } from './contact-type/contact-type.module';
import { ApplicationStatusModule } from './application-status/application-status.module';
import { SexModule } from './sex/sex.module';
import { SchoolClassModule } from './school-class/school-class.module';
import { SchoolReportGroupModule } from './school-report-group/school-report-group.module';
import { TitleModule } from './title/title.module';
import { ApplicantStatusModule } from './applicant-status/applicant-status.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot(mailConfig),
    AuthModule,
    UserModule,
    ApplicantModule,
    ApplicantStatusModule,
    ApplicationModule,
    LanguageModule,
    ReligionModule,
    CountryModule,
    ContactTypeModule,
    ApplicationStatusModule,
    SexModule,
    TitleModule,
    SchoolClassModule,
    SchoolReportGroupModule,
  ],
  controllers: [AppController],
  providers: [],
  exports:[]
})
export class AppModule {}
