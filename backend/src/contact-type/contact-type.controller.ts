import { AllowApplicant } from 'src/auth/access.decorator';
import { Controller, Get } from '@nestjs/common';
import { ContactTypeService } from './contact-type.service';
import { ContactType } from '@prisma/client';

@AllowApplicant()
@Controller('contact-type')
export class ContactTypeController {
    constructor(
        private readonly contactService: ContactTypeService
    ){}

    @Get()
    async getMany(): Promise<ContactType[]> {
        return this.contactService.getMany()
    }
}
