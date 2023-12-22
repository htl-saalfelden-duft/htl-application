import { Entity } from "../common/decorators/entity.decorator"
import { ApplicantDetails } from "./applicant-details.model"
import { Application } from "./application.model"
import { Contact } from "./contact.model"
import { SchoolReport } from "./schoolReport.model"

@Entity('applicant')
export class Applicant {
    id?: string
    contactEmail?: string
    password?: string
    contacts?: Contact[]
    schoolReport?: SchoolReport
    details?: ApplicantDetails
    applications?: Application[]
} 