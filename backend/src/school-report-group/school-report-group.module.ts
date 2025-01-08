import { Module } from '@nestjs/common';
import { SchoolReportGroupController } from './school-report-group.controller';
import { SchoolReportGroupService } from './school-report-group.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchoolReportGroupController],
  providers: [SchoolReportGroupService]
})
export class SchoolReportGroupModule {}
