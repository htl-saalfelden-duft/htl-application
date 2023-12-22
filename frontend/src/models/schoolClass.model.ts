import { Entity } from "../common/decorators/entity.decorator";

@Entity('school-class')
export class SchoolClass {
    title!: string
}