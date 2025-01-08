import { Module } from '@nestjs/common';
import { ApplicationStatusController } from './application-status.controller';
import { ApplicationStatusService } from './application-status.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationStatusController],
  providers: [ApplicationStatusService]
})
export class ApplicationStatusModule {}
