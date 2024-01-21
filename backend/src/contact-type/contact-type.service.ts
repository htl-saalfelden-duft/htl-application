import { Injectable } from '@nestjs/common';
import { ContactType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ContactTypeService {
    constructor(private prisma: PrismaService) {}

    getMany(): Promise<ContactType[]> {
        return this.prisma.contactType.findMany({orderBy: {title: 'asc'}}) 
    }
}
