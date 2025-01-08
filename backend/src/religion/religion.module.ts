import { Module } from '@nestjs/common';
import { ReligionController } from './religion.controller';
import { ReligionService } from './religion.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReligionController],
  providers: [ReligionService]
})
export class ReligionModule {}
