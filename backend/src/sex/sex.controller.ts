import { AllowApplicant } from 'src/auth/access.decorator';
import { Controller, Get } from '@nestjs/common';
import { SexService } from './sex.service';
import { Sex } from '@prisma/client';

@AllowApplicant()
@Controller('sex')
export class SexController {
    constructor(
        private readonly sexService: SexService
    ){}

    @Get()
    async getMany(): Promise<Sex[]> {
        return this.sexService.getMany()
    }
}
