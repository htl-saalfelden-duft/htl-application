import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma.module';
import { UserController } from './user.controller';
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    EmailConfirmationModule,
    AuthModule
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
