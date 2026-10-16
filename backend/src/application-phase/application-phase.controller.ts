import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminOnly } from 'src/auth/access.decorator';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { ApplicationPhaseService, ClosePhaseCounts } from './application-phase.service';

export const CLOSE_CONFIRMATION = 'ABSCHLIESSEN';

@AdminOnly()
@Controller('application-phase')
export class ApplicationPhaseController {
	constructor(private readonly applicationPhaseService: ApplicationPhaseService) { }

	@Get('close/preview')
	preview(): Promise<ClosePhaseCounts> {
		return this.applicationPhaseService.preview()
	}

	@Post('close')
	close(@Body() dto: { confirmation: string }): Promise<ClosePhaseCounts> {
		if (dto?.confirmation !== CLOSE_CONFIRMATION) {
			throw new ApiError(ApiErrorType.INVALID_INPUT)
		}
		return this.applicationPhaseService.close()
	}
}
