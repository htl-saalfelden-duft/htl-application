import { Injectable } from '@nestjs/common';
import { Application, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ApplicationService {
    constructor(private prisma: PrismaService) {}

    getOne(where: Prisma.ApplicationWhereUniqueInput): Promise<Application> {
      return this.prisma.application.findUnique({where})
    }
  
    getMany(where: Prisma.ApplicationWhereInput): Promise<Application[]> {
      return this.prisma.application.findMany({where, include: {schoolClass: true}}) 
    }
  
    create(data: Prisma.ApplicationCreateInput) {
      return this.prisma.application.create({
          data,
      })
    }
  
    update(params: {
        where: Prisma.ApplicationWhereUniqueInput;
        data: Prisma.ApplicationUpdateInput;
      }) {
        const { data, where } = params;
        return this.prisma.application.update({
            where,
            data,
        })        
    }
  
    delete(where: Prisma.ApplicationWhereUniqueInput): Promise<Application> {
        return this.prisma.application.delete({where})
    }
}
