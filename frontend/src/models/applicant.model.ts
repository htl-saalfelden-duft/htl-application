import { Entity } from "../common/decorators/entity.decorator"
import { ApplicantDetails } from "./applicant-details.model"
import { Application } from "./application.model"
import { Contact } from "./contact.model"
import { SchoolReport } from "./schoolReport.model"

@Entity('applicant')
export class Applicant {
    id?: string
    email?: string
    emailConfirmed?: boolean
    password?: string
    statusKey?: ApplicantStatusKey
    dsgvo?: boolean
    registeredAt?: Date
    contacts?: Contact[]
    schoolReport?: SchoolReport
    details?: ApplicantDetails
    applications?: Application[]
}

@Entity('applicantStatus')
export class ApplicantStatus {
    key!: string
    title!: string
}

export type ApplicantStatusKey = 'created' | 'applied' | 'registered' | 'completed'