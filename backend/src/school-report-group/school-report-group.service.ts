import { Injectable } from '@nestjs/common';
import { Prisma, SchoolReportGroup } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SchoolReportGroupService {
    constructor(private prisma: PrismaService) {}

    getMany(where: Prisma.SchoolReportGroupWhereInput): Promise<SchoolReportGroup[]> {
        return this.prisma.schoolReportGroup.findMany({where, orderBy: {title: 'asc'}}) 
    }   
}
