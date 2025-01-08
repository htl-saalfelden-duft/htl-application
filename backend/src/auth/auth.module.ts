import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'
import { jwtConstants } from '../config/jwt.config'
import { PrismaModule } from '../prisma.module'
import * as fs from 'fs';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secretOrKeyProvider: () => fs.readFileSync(process.env.RSA_PRIVATE_KEY_FILE, 'utf8'),
          signOptions: { 
            algorithm: 'RS256',
            expiresIn: process.env.JWT_EXPIRATION_TIME
          },
          secret: jwtConstants.secret
        }),
        PrismaModule,
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
