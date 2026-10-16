import { Entity } from "../common/decorators/entity.decorator";

@Entity('schoolClass')
export class SchoolClass {
    id!: string
    title!: string
    sfkz!: string
    year!: string
    maxPupils!: number
    active!: boolean
}

export interface SchoolClassCopyResult {
    created: number
    skipped: number
    deactivated: number
}

// Suggests the following school year, e.g. "24/25" -> "25/26"
export const nextSchoolYear = (year: string): string => {
    const match = /^(\d{2})\/(\d{2})$/.exec(year)
    if (!match) return ''
    const pad = (value: number) => String(value % 100).padStart(2, '0')
    return `${pad(Number(match[1]) + 1)}/${pad(Number(match[2]) + 1)}`
}
