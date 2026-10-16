import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { SettingModule } from 'src/setting/setting.module';
import { ApplicationPhaseController } from './application-phase.controller';
import { ApplicationPhaseService } from './application-phase.service';

@Module({
  imports: [PrismaModule, SettingModule],
  controllers: [ApplicationPhaseController],
  providers: [ApplicationPhaseService]
})
export class ApplicationPhaseModule {}
