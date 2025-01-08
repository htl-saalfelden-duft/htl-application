import { Controller, Get } from '@nestjs/common';
import { ApplicantStatusService } from './applicant-status.service';
import { ApplicantStatus } from '@prisma/client';

@Controller('applicant-status')
export class ApplicantStatusController {
    constructor(
        private readonly applicantStatusService: ApplicantStatusService
    ){}
    
    @Get()
    async getMany(): Promise<ApplicantStatus[]> {
        return this.applicantStatusService.getMany()
    }
}
