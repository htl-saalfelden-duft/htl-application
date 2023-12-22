import { Injectable } from '@nestjs/common';
import { Country, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CountryService {
    constructor(private prisma: PrismaService) {}
    
    getMany(where: Prisma.CountryWhereInput): Promise<Country[]> {
        return this.prisma.country.findMany({where}) 
    }
}
