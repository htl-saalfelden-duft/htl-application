import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AllowApplicant } from 'src/auth/access.decorator';
import { RequestWithUser } from 'src/auth/request-with-user.model';
import { EmailConfirmationGuard } from 'src/email-confirmation/email-confirmation.guard';
import { TrialDayDto, TrialDayService } from './trial-day.service';
import { AdministrationRegistrationDto, TrialDayRegistrationService } from './trial-day-registration.service';

@Controller('trial-day')
export class TrialDayController {
	constructor(
		private readonly trialDayService: TrialDayService,
		private readonly registrationService: TrialDayRegistrationService
	) { }

	@Get()
	@AllowApplicant()
	@UseGuards(EmailConfirmationGuard)
	getMany(
		@Request() req: RequestWithUser,
		@Query('schoolClass') schoolClassID: string,
		@Query('past') past: string,
	) {
		return this.trialDayService.getMany({
			forApplicant: req.user.userType === 'applicant',
			schoolClassID,
			past: past === 'true'
		})
	}

	@Post()
	create(@Body() dto: TrialDayDto) {
		return this.trialDayService.create(dto)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: TrialDayDto) {
		return this.trialDayService.update(id, dto)
	}

	@Delete(':id')
	delete(@Param('id') id: string) {
		return this.trialDayService.delete(id)
	}

	@Get(':id/registrations')
	getRegistrations(@Param('id') id: string) {
		return this.registrationService.getForTrialDay(id)
	}

	@Post(':id/registrations')
	register(@Param('id') id: string, @Body() dto: AdministrationRegistrationDto) {
		return this.registrationService.registerByAdministration(id, dto)
	}
}
