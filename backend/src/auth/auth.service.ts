import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtTokenPayload } from './jwt-token-payload.model'
import { TokenDto } from './token.dto'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService
    ) { }

    createToken(id: string, userType: string): TokenDto {
        const expiresIn = process.env.JWT_EXPIRATION_TIME
        const payload: JwtTokenPayload = { id, userType }
        const jwtBearerToken = this.jwtService.sign(payload)

        return {
            idToken: jwtBearerToken,
            expiresIn,
            userType
        }
    }
}
