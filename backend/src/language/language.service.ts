import { Injectable } from '@nestjs/common';
import { Language, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LanguageService {
    constructor(private prisma: PrismaService) {}

    getMany(where: Prisma.LanguageWhereInput): Promise<Language[]> {
        return this.prisma.language.findMany({where, orderBy: {title: 'asc'}}) 
    }
}
