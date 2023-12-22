import { Injectable } from '@nestjs/common';
import { Prisma, Religion } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReligionService {
    constructor(private prisma: PrismaService) {}

    getMany(where: Prisma.ReligionWhereInput): Promise<Religion[]> {
        return this.prisma.religion.findMany({where}) 
    }
}
