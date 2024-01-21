import { Injectable } from '@nestjs/common';
import { Sex } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SexService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<Sex[]> {
        return this.prisma.sex.findMany({orderBy: {title: 'asc'}}) 
    }
}
