import { Entity } from "../common/decorators/entity.decorator"

export interface SchoolReport {
    gerGrade?: 		number
    gerGroup?:		string
	engGrade?:	    number
	engGroup?:	    string
	mathGrade?:	    number
	mathGroup?:	    string
	historyGrade?:	number
	geographyGrade?:	number
	chemistryGrade?:	number
	physicsGrade?:	number
	biologieGrade?: number
}
@Entity('schoolReportGroup')
export class SchoolReportGroups {
	title!: string
}