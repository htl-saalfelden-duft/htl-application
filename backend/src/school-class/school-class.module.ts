import { Module } from '@nestjs/common';
import { SchoolClassController } from './school-class.controller';
import { SchoolClassService } from './school-class.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchoolClassController],
  providers: [SchoolClassService]
})
export class SchoolClassModule {}
