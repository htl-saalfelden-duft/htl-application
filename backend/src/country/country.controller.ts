import { Controller, Get, Query } from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from '@prisma/client';

@Controller('country')
export class CountryController {
    constructor(
        private readonly countryService: CountryService
    ){}

    @Get()
    async getMany(@Query('title') title: string): Promise<Country[]> {
        return this.countryService.getMany({title: {contains: title}})
    }
}
