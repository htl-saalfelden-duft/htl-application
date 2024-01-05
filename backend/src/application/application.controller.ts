/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { ApplicationService } from './application.service';

@Controller('application')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}

    @Get()
    async getMany(@Query('applicantID') applicantID: string): Promise<Application[]> {
        return this.applicationService.getMany({applicantID})
    }

    // @Get(':id')
    // async getOne(@Param('id') id: string): Promise<Application> {
    //     return this.applicationService.getOne({ id })
    // }

    // @Get()
    // async getMany(): Promise<Application[]> {
    //     return this.applicationService.getMany()
    // }

    // @Post()
    // async create(
    //     @Body() applicationData: Prisma.ApplicationCreateInput
    // ): Promise<Application> {
    //     return this.applicationService.create(applicationData)
    // }
    
    // @Put(':id')
    // async update(@Param('id') id: string, @Body() data: Prisma.ApplicationUpdateInput): Promise<Application> {
    //     return this.applicationService.update({
    //         where: { id },
    //         data
    //     })
    // }
}
