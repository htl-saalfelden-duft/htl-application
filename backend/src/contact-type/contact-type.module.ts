import { Module } from '@nestjs/common';
import { ContactTypeController } from './contact-type.controller';
import { ContactTypeService } from './contact-type.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactTypeController],
  providers: [ContactTypeService]
})
export class ContactTypeModule {}
