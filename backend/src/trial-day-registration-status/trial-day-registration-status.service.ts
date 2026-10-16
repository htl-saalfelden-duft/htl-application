import { Injectable } from '@nestjs/common';
import { TrialDayRegistrationStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TrialDayRegistrationStatusService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<Partial<TrialDayRegistrationStatus>[]> {
        return this.prisma.trialDayRegistrationStatus.findMany(
            { 
                select: { key: true, title: true, pos: true },
                orderBy: {pos: 'asc'}
            }
        ) 
    }
}
