import { Module } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { PrismaModule } from 'src/prisma.module';
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmailConfirmationModule
  ],
  controllers: [ApplicantController],
  providers: [ApplicantService, JwtStrategy],
  exports: [ApplicantService]
})
export class ApplicantModule {}
