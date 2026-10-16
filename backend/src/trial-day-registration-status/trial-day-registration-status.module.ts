import { Module } from '@nestjs/common';
import { TrialDayRegistrationStatusController } from './trial-day-registration-status.controller';
import { TrialDayRegistrationStatusService } from './trial-day-registration-status.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrialDayRegistrationStatusController],
  providers: [TrialDayRegistrationStatusService]
})
export class TrialDayRegistrationStatusModule {}
