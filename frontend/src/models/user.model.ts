import { Entity } from "../common/decorators/entity.decorator";

@Entity('user')
export class User {
    id!: string
    name!: string
    email!: string
}