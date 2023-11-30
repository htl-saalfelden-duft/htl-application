import { Entity } from "../common/decorators/entity.decorator"

@Entity('applicant')
export class Applicant {
    contactEmail!: String
    password!: String
} 