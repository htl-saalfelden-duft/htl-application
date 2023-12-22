import { Entity } from "../common/decorators/entity.decorator";

@Entity('religion')
export class Religion {
    title!: string
}