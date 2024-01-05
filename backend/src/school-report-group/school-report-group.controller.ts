import { Controller, Get, Query } from '@nestjs/common';
import { SchoolReportGroup } from '@prisma/client';
import { SchoolReportGroupService } from './school-report-group.service';

@Controller('school-report-group')
export class SchoolReportGroupController {
    constructor(
        private readonly religionService: SchoolReportGroupService
    ){}

    @Get()
    async getMany(@Query('title') title: string): Promise<SchoolReportGroup[]> {
        return this.religionService.getMany({title: {contains: title}})
    }    
}
