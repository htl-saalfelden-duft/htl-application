import { Module } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { PrismaModule } from 'src/prisma.module';
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { SettingModule } from 'src/setting/setting.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmailConfirmationModule,
    SettingModule
  ],
  controllers: [ApplicantController],
  providers: [ApplicantService, JwtStrategy],
  exports: [ApplicantService]
})
export class ApplicantModule {}
