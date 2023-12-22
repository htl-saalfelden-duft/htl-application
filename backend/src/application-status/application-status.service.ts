import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ApplicationStatusService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<ApplicationStatus[]> {
        return this.prisma.applicationStatus.findMany() 
    }
}
