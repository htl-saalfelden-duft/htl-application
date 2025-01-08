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
}
