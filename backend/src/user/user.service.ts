import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { Observable, from, map } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import * as crypto from 'crypto'
import { SignInDto } from 'src/auth/sign-in.dto';
import { ApiError, ApiErrorType } from 'src/common/api-error';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    getOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.findUnique({where})
    }

    create(data: Prisma.UserCreateInput): Promise<User> {
        this.setPassword(data, (data as any).password)
        return this.prisma.user.create({
            data,
        })
    }

    checkCredentials(signInDto: SignInDto): Observable<string> {
        return this.getByEmail(signInDto.email).pipe(
            map((user: User) => {
                if (user) {
                    if (!user.active) {
                        throw new ApiError(ApiErrorType.USER_NOT_ACTIVE)
                    }

                    const passHash = crypto.createHmac('sha512', process.env.HMAC_SECRET).update(signInDto.password).digest('hex')
                    if (user.passwordHash === passHash) {
                        delete user.passwordHash
                        return user.id
                    } else {
                        throw new ApiError(ApiErrorType.WRONG_PASSWORD)
                    }
                } else {
                    throw new ApiError(ApiErrorType.USER_NOT_FOUND)
                }
            })
        )
    }

    getByEmail(email: string): Observable<User> {
        return from(this.prisma.user.findUnique({
          where: { email }
        }))
    }
    
    private setPassword(user: Prisma.UserCreateInput, password: string) {
        const passHash = crypto.createHmac('sha512', process.env.HMAC_SECRET).update(password).digest('hex')
        user.passwordHash = passHash
    }
}
