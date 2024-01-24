import { Injectable } from '@nestjs/common';
import { ApplicantStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ApplicantStatusService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<ApplicantStatus[]> {
        return this.prisma.applicationStatus.findMany({orderBy: {title: 'asc'}}) 
    }
}
