import { Controller, Get, Query } from '@nestjs/common';
import { LanguageService } from './language.service';
import { Language } from '@prisma/client';

@Controller('language')
export class LanguageController {
    constructor(
        private readonly languageService: LanguageService
    ){}

    @Get()
    async getMany(@Query('title') title: string): Promise<Language[]> {
        return this.languageService.getMany({title: {contains: title}})
    }
}
