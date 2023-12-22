import { Entity } from "../common/decorators/entity.decorator"
import { SchoolClass } from "./schoolClass.model"

@Entity('application')
export class Application {
    id?: string
    priority!: number
    statusKey!: string
    schoolClassID!: string
    schoolClass?: SchoolClass
}