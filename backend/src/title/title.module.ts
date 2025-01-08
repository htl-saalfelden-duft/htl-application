import { Module } from '@nestjs/common';
import { TitleController } from './title.controller';
import { TitleService } from './title.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TitleController],
  providers: [TitleService]
})
export class TitleModule {}
