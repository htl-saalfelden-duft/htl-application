import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

export const APPLICATION_OPEN = 'applicationOpen';

@Injectable()
export class SettingService {
    constructor(private prisma: PrismaService) {}

    async isApplicationOpen(): Promise<boolean> {
        const setting = await this.prisma.setting.findUnique({ where: { key: APPLICATION_OPEN } });
        return setting?.value === true;
    }

    setApplicationOpen(value: boolean): Promise<boolean> {
        return this.prisma.setting.upsert({
            where: { key: APPLICATION_OPEN },
            update: { value },
            create: { key: APPLICATION_OPEN, value }
        }).then(setting => setting.value === true);
    }
}
