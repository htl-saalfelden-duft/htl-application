import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
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
  ],
  exports: [
    EmailConfirmationService
  ]
})
export class EmailConfirmationModule { }
