import { AllowApplicant } from 'src/auth/access.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ReligionService } from './religion.service';
import { Religion } from '@prisma/client';

@AllowApplicant()
@Controller('religion')
export class ReligionController {
    constructor(
        private readonly religionService: ReligionService
    ){}

    @Get()
    async getMany(@Query('title') title: string): Promise<Religion[]> {
        return this.religionService.getMany({title: {contains: title}})
    }
}
