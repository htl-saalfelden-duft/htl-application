import { Entity } from "../common/decorators/entity.decorator";

@Entity('title')
export class Title {
    title!: string
}