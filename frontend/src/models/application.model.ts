import { Entity } from "../common/decorators/entity.decorator"
import { SchoolClass } from "./schoolClass.model"

@Entity('application')
export class Application {
    id?: string
    priority?: number
    statusKey?: ApplicationStatusKey
    schoolClassID!: string
    schoolClass?: SchoolClass
    applicantID?: number
}

@Entity('applicationStatus')
export class ApplicationStatus {
    key!: string
    title!: string
}

export type ApplicationStatusKey = 'created' | 'applied' | 'accepted' | 'rejected'