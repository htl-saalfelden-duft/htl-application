import { Controller, Get } from '@nestjs/common';
import { SexService } from './sex.service';
import { Sex } from '@prisma/client';

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
