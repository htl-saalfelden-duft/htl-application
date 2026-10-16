import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingService } from './setting.service';
import { Public } from 'src/auth/public.decorator';
import { AdminOnly } from 'src/auth/access.decorator';
import { ApiError, ApiErrorType } from 'src/common/api-error';

@Controller('setting')
export class SettingController {
    constructor(private readonly settingService: SettingService) {}

    @Public()
    @Get('applicationOpen')
    async getApplicationOpen(): Promise<{ value: boolean }> {
        return { value: await this.settingService.isApplicationOpen() };
    }

    @AdminOnly()
    @Patch('applicationOpen')
    async setApplicationOpen(@Body() dto: { value: boolean }): Promise<{ value: boolean }> {
        if (typeof dto?.value !== 'boolean') {
            throw new ApiError(ApiErrorType.INVALID_INPUT);
        }
        return { value: await this.settingService.setApplicationOpen(dto.value) };
    }
}
