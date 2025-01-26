import { Injectable } from '@nestjs/common';
import { ApplicantStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ApplicantStatusService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<Partial<ApplicantStatus>[]> {
        return this.prisma.applicantStatus.findMany(
            { select: { key: true, title: true } }
        ) 
    }
}
