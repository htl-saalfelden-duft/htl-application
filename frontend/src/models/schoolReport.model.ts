import { Entity } from "../common/decorators/entity.decorator"

import { isNumber } from "lodash"

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

export const schoolReportComplete = (report: SchoolReport | undefined) => {
	if(!report)
		return false
	
	const { 
		gerGrade,
		gerGroup,
		engGrade,
		engGroup,
		mathGrade,
		mathGroup,
		historyGrade,
		geographyGrade,
		chemistryGrade,
		physicsGrade,
		biologieGrade,
	} = report

	return (isNumber(gerGrade) &&
		gerGroup &&
		isNumber(engGrade) &&
		engGroup &&
		isNumber(mathGrade) &&
		mathGroup &&
		isNumber(historyGrade) &&
		isNumber(geographyGrade) &&
		isNumber(chemistryGrade) &&
		isNumber(physicsGrade) &&
		isNumber(biologieGrade))
}
@Entity('schoolReportGroup')
export class SchoolReportGroups {
	title!: string
}