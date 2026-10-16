import { AllowApplicant } from 'src/auth/access.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApplicationStatusService } from './application-status.service';
import { ApplicationStatus } from '@prisma/client';

@AllowApplicant()
@Controller('application-status')
export class ApplicationStatusController {
    constructor(
        private readonly applicantStatusService: ApplicationStatusService
    ){}
    
    @Get()
    async getMany(): Promise<ApplicationStatus[]> {
        return this.applicantStatusService.getMany()
    }
}
