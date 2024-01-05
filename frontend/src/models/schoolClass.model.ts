import { Entity } from "../common/decorators/entity.decorator";

@Entity('schoolClass')
export class SchoolClass {
    id!: string
    title!: string
}