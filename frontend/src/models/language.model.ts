import { Entity } from "../common/decorators/entity.decorator";

@Entity('language')
export class Language {
    title!: string
}