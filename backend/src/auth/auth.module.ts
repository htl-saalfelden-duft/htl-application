import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module'
import { jwtConstants } from '../config/jwt.config'
import { PrismaModule } from '../prisma.module'

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secretOrKeyProvider: () => process.env.RSA_PRIVATE_KEY.replace(/\\n/gm, '\n'),
          signOptions: { 
            algorithm: 'RS256',
            expiresIn: process.env.JWT_EXPIRATION_TIME
          },
          secret: jwtConstants.secret
        }),
        PrismaModule,
        EmailConfirmationModule
      ],
      providers: [
        JwtStrategy,
        AuthService,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        }    
      ],
      exports: [AuthService]
})
export class AuthModule { }
