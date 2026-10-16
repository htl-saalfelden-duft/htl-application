import { AdminOnly, AllowApplicant } from 'src/auth/access.decorator';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SchoolClassCopyDto, SchoolClassDto, SchoolClassService } from './school-class.service';
import { SchoolClass } from '@prisma/client';

@Controller('school-class')
export class SchoolClassController {
    constructor(
        private readonly schoolClassService: SchoolClassService
    ){}

    // Only active school classes can be chosen
    @Get()
    @AllowApplicant()
    async getMany(@Query('title') title: string): Promise<Partial<SchoolClass>[]> {
        return this.schoolClassService.getMany({
            title: {contains: title},
            active: true
        })
    }

    @Get('all')
    @AdminOnly()
    getAll(): Promise<SchoolClass[]> {
        return this.schoolClassService.getAll()
    }

    @Post()
    @AdminOnly()
    create(@Body() dto: SchoolClassDto): Promise<SchoolClass> {
        return this.schoolClassService.create(dto)
    }

    @Post('copy')
    @AdminOnly()
    copy(@Body() dto: SchoolClassCopyDto) {
        return this.schoolClassService.copy(dto)
    }

    @Patch(':id')
    @AdminOnly()
    update(@Param('id') id: string, @Body() dto: SchoolClassDto): Promise<SchoolClass> {
        return this.schoolClassService.update(id, dto)
    }
}
