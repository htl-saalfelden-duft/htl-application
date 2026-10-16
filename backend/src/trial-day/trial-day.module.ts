import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module';
import { TrialDayController } from './trial-day.controller';
import { TrialDayRegistrationController } from './trial-day-registration.controller';
import { TrialDayService } from './trial-day.service';
import { TrialDayRegistrationService } from './trial-day-registration.service';
import { TrialDayMailService } from './trial-day-mail.service';

@Module({
  imports: [PrismaModule, EmailConfirmationModule],
  controllers: [TrialDayController, TrialDayRegistrationController],
  providers: [TrialDayService, TrialDayRegistrationService, TrialDayMailService]
})
export class TrialDayModule {}
