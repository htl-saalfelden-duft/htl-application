import { AllowApplicant } from 'src/auth/access.decorator';
import { Controller, Get } from '@nestjs/common';
import { TrialDayRegistrationStatusService } from './trial-day-registration-status.service';
import { TrialDayRegistrationStatus } from '@prisma/client';

@AllowApplicant()
@Controller('trial-day-registration-status')
export class TrialDayRegistrationStatusController {
    constructor(
        private readonly trialDayRegistrationStatusService: TrialDayRegistrationStatusService
    ){}
    
    @Get()
    async getMany(): Promise<Partial<TrialDayRegistrationStatus>[]> {
        return this.trialDayRegistrationStatusService.getMany()
    }
}
