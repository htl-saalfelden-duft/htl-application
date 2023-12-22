import { Entity } from "../common/decorators/entity.decorator";

@Entity('sex')
export class Sex {
    title!: string
}