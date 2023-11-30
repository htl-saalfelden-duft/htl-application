import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { EmailConfirmationGuard } from "./email-confirmation.guard";
import { EmailConfirmationService } from "./email-confirmation.service";
import { PrismaModule } from "src/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({}),
    PrismaModule
  ],
  providers: [
    EmailConfirmationService,
    {
      provide: APP_GUARD,
      useClass: EmailConfirmationGuard,
    }
  ],
  exports: [
    EmailConfirmationService
  ]
})
export class EmailConfirmationModule { }
