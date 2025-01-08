import { Entity } from "../common/decorators/entity.decorator";

@Entity('country')
export class Country {
    title!: string
}