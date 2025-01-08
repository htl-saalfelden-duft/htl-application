import { Module } from '@nestjs/common';
import { ApplicantStatusController } from './applicant-status.controller';
import { ApplicantStatusService } from './applicant-status.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicantStatusController],
  providers: [ApplicantStatusService]
})
export class ApplicantStatusModule {}
