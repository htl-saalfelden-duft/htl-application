import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';
import { Observable, from, map, mergeMap } from 'rxjs';
import { EmailConfirmationService } from 'src/email-confirmation/email-confirmation.service';
import { AuthService } from 'src/auth/auth.service';
import { SignInDto } from 'src/auth/sign-in.dto';
import { TokenDto } from 'src/auth/token.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly emailConfirmationService: EmailConfirmationService,
        private readonly authService: AuthService
    ) {}

    @Get('current')
    current(@Request() req: any): Promise<User> {
      // User comes from validate-function in jwt-strategy
      return this.userService.getOne({id: req.user.id})
    }

    @Public()
    @Post('signIn')
    signIn(@Body() signInDto: SignInDto): Observable<TokenDto> {
      return this.userService.checkCredentials(signInDto).pipe(
        map(id => this.authService.createToken(id))
      )
    }

    @Get(':id')
    show(@Param('id') id: string): Promise<User> {
        return this.userService.getOne({id})
    }

    @Public()
    @Post('register')
    register(@Body() dto: Prisma.UserCreateInput): Observable<User> {
      return from(this.userService.create(dto)).pipe(
        mergeMap(user => this.emailConfirmationService.sendVerificationLink(user.email).pipe(
          map(() => {
            delete user.passwordHash
            return user
          })
        ))
      )
    }

    // @Get()
    // index(@Request() req: any): Promise<User[]> {
    //     return this.userService.index(req.query)
    // }

    // @Patch('password_new')
    // changePW(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto): Promise<any> {
    //     // User comes from validate-function in jwt-strategy
    //     return this.userService.updatePassword(req.user, changePasswordDto)
    // }

    // @Patch(':id')
    // update(@Body() dto: User): Promise<User> {
    //     return this.userService.update(dto)
    // }

    // @Delete(':id')
    // delete(@Param('id') id: number): Observable<DeleteResult> {
    //     return this.userService.delete(id)
    // }     
}
