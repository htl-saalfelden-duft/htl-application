import { Injectable } from '@nestjs/common';
import { Prisma, SchoolClass } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SchoolClassService {
    constructor(private prisma: PrismaService) {}
    
    getMany(where: Prisma.SchoolClassWhereInput): Promise<SchoolClass[]> {
        return this.prisma.schoolClass.findMany({where}) 
    }    
}
