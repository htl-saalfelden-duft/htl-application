import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { Applicant, Prisma } from "@prisma/client";
import { Observable, from, map, mergeMap } from "rxjs";
import { Public } from "src/auth/public.decorator";
import { EmailConfirmationService } from "src/email-confirmation/email-confirmation.service";
import { ApplicantService } from "./applicant.service";
import ConfirmEmailDto from "src/email-confirmation/confirm-email.dto";
import { ApiError, ApiErrorType } from "src/common/api-error";
import { SignInDto } from "src/auth/sign-in.dto";
import { AuthService } from "src/auth/auth.service";
import { TokenDto } from "src/auth/token.dto";
import { EmailConfirmationGuard } from "src/email-confirmation/email-confirmation.guard";

@Controller('applicant')
export class ApplicantController {
  constructor(
    private readonly applicantService: ApplicantService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly authService: AuthService
  ) { }

  @Get('current')
  @UseGuards(EmailConfirmationGuard)
  current(@Request() req: any): Promise<Applicant> {
    // User comes from validate-function in jwt-strategy
    return this.applicantService.getOne({
      id: true,
      email: true
    }, {
      id: req.user.id
    })
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Applicant> {
    return this.applicantService.getOne(null, {
      id
    })
  }

  @Get()
  async getMany(): Promise<Applicant[]> {
    return this.applicantService.getMany()
  }

  @Patch(':id')
  update(@Body() dto: Applicant): Promise<Applicant> {
    const { id } = dto
    delete dto.id
    return this.applicantService.update({
      where: { id },
      data: dto
    })
  }

  @Post()
  async create(@Body() applicantData: Prisma.ApplicantCreateInput): Promise<Applicant> {
    return this.applicantService.create(applicantData)
  }

  @Public()
  @Post('signIn')
  signIn(@Body() signInDto: SignInDto): Observable<TokenDto> {
    return this.applicantService.checkCredentials(signInDto).pipe(
      map(id => this.authService.createToken(id, 'applicant'))
    )
  }

  @Public()
  @Post('register')
  registerApplicant(@Body() dto: Prisma.ApplicantCreateInput): Observable<Applicant> {
    return from(this.applicantService.create(dto)).pipe(
      mergeMap(applicant => this.emailConfirmationService.sendVerificationLink(applicant.email).pipe(
        map(() => {
          delete applicant.passwordHash
          return applicant
        })
      ))
    )
  }

  @Public()
  @Post('confirm')
  confirm(@Body() confirmationData: ConfirmEmailDto): Observable<unknown> {
    return from(this.emailConfirmationService.decodeConfirmationToken(confirmationData.token)).pipe(
      mergeMap(email => this.applicantService.confirmEmail(email)),
      map(() => { success: true })
    )
  }

  @Public()
  @Post(':id/resendConfirmation')
  resendConfirmation(@Param('id') id: string): Observable<unknown> {
    return from(this.applicantService.getOne(null, { id })).pipe(
      mergeMap(applicant => {
        if (applicant.emailConfirmed) {
          throw new ApiError(ApiErrorType.EMAIL_ALREADY_CONFIRMED);
        }
        return this.emailConfirmationService.sendVerificationLink(applicant.email);
      })
    )
  }
}
