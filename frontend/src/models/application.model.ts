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

export type ApplicationStatusKey = 'created' | 'applied' | 'inProgress' | 'completed'