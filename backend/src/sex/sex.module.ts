import { Module } from '@nestjs/common';
import { SexController } from './sex.controller';
import { SexService } from './sex.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SexController],
  providers: [SexService]
})
export class SexModule {}
