import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AllowApplicant } from 'src/auth/access.decorator';
import { RequestWithUser } from 'src/auth/request-with-user.model';
import { EmailConfirmationGuard } from 'src/email-confirmation/email-confirmation.guard';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { ApplicantRegistrationDto, TrialDayRegistrationService } from './trial-day-registration.service';

@AllowApplicant()
@UseGuards(EmailConfirmationGuard)
@Controller('trial-day-registration')
export class TrialDayRegistrationController {
	constructor(private readonly registrationService: TrialDayRegistrationService) { }

	@Get('mine')
	getMine(@Request() req: RequestWithUser) {
		assertApplicant(req)
		return this.registrationService.getMine(req.user.id)
	}

	@Post()
	register(@Request() req: RequestWithUser, @Body() dto: ApplicantRegistrationDto) {
		assertApplicant(req)
		return this.registrationService.registerByApplicant(req.user.id, dto)
	}

	// Applicants until the deadline, administration any time
	@Post(':id/cancel')
	cancel(@Request() req: RequestWithUser, @Param('id') id: string) {
		return this.registrationService.cancel(id, req.user)
	}

	@Post(':id/rebook')
	rebook(@Request() req: RequestWithUser, @Param('id') id: string, @Body() dto: { trialDayID: string }) {
		assertApplicant(req)
		return this.registrationService.rebook(id, dto?.trialDayID, req.user)
	}
}

const assertApplicant = (req: RequestWithUser) => {
	if (req.user.userType !== 'applicant') {
		throw new ApiError(ApiErrorType.FORBIDDEN)
	}
}
