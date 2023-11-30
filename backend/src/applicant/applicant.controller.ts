import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
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

@Controller('applicant')
export class ApplicantController {
  constructor(
    private readonly applicantService: ApplicantService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly authService: AuthService
  ) { }

  @Get('current')
  current(@Request() req: any): Promise<Applicant> {
    // User comes from validate-function in jwt-strategy
    return this.applicantService.getOne({
      id: true,
      contactEmail: true
    }, { 
      id: req.user.id 
    })
  }

  @Public()
  @Post('signIn')
  signIn(@Body() signInDto: SignInDto): Observable<TokenDto> {
    return this.applicantService.checkCredentials(signInDto).pipe(
      map(id => this.authService.createToken(id))
    )
  }

  @Public()
  @Post('register')
  registerApplicant(@Body() dto: Prisma.ApplicantCreateInput): Observable<Applicant> {
    return from(this.applicantService.create(dto)).pipe(
      mergeMap(applicant => this.emailConfirmationService.sendVerificationLink(applicant.contactEmail).pipe(
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
    return from(this.applicantService.getOne(null, {id})).pipe(
      mergeMap(applicant => {
        if (applicant.emailConfirmed) {
          throw new ApiError(ApiErrorType.EMAIL_ALREADY_CONFIRMED);
        }
        return this.emailConfirmationService.sendVerificationLink(applicant.contactEmail);
      })
    )
  }
}
