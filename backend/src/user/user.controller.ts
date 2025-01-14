import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';
import { Observable, from, map } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { SignInDto } from 'src/auth/sign-in.dto';
import { TokenDto } from 'src/auth/token.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @Get('current')
  current(@Request() req: any): Promise<Partial<User>> {
    // User comes from validate-function in jwt-strategy
    return this.userService.getOne({ id: req.user.id })
  }

  @Public()
  @Post('signIn')
  signIn(@Body() signInDto: SignInDto): Observable<TokenDto> {
    return this.userService.checkCredentials(signInDto).pipe(
      map(id => this.authService.createToken(id, 'administration'))
    )
  }

  @Get(':id')
  show(@Param('id') id: string): Promise<Partial<User>> {
    return this.userService.getOne({ id })
  }

  @Get()
  async getMany(): Promise<Partial<User>[]> {
    return this.userService.getMany()
  }

  @Public()
  @Post('register')
  register(@Body() dto: User): Observable<Partial<User>> {
    return from(this.userService.create(dto))
  }

  // @Patch('password_new')
  // changePW(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto): Promise<any> {
  //     // User comes from validate-function in jwt-strategy
  //     return this.userService.updatePassword(req.user, changePasswordDto)
  // }

  @Patch(':id')
  update(@Body() dto: User): Observable<Partial<User>> {
    const { id } = dto
    delete dto.id

    return from(this.userService.update({
      data: dto,
      where: { id }
    }))
  }

  @Delete(':id')
  delete(@Param('id') id: string): Observable<Partial<User>> {
    return from(this.userService.delete(id))
  }
}
