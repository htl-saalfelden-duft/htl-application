import { Injectable } from '@nestjs/common';
import { Title } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TitleService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<Title[]> {
        return this.prisma.title.findMany({orderBy: {title: 'asc'}}) 
    }
}
