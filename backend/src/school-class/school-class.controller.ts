import { Controller, Get, Query } from '@nestjs/common';
import { SchoolClassService } from './school-class.service';
import { SchoolClass } from '@prisma/client';

@Controller('school-class')
export class SchoolClassController {
    constructor(
        private readonly countryService: SchoolClassService
    ){}

    @Get()
    async getMany(@Query('title') title: string): Promise<SchoolClass[]> {
        return this.countryService.getMany({
            title: {contains: title},
            active: true
        })
    }    
}
