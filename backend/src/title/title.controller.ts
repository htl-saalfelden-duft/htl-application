import { Controller, Get } from '@nestjs/common';
import { TitleService } from './title.service';
import { Title } from '@prisma/client';

@Controller('title')
export class TitleController {
    constructor(
        private readonly titleService: TitleService
    ){}

    @Get()
    async getMany(): Promise<Title[]> {
        return this.titleService.getMany()
    }
}
