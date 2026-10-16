import { Entity } from "../common/decorators/entity.decorator"

@Entity('setting')
export class Setting {
    value!: boolean
}

@Entity('applicationPhase')
export class ApplicationPhase {
    applicantsToDelete!: number
    applicantsToAnonymize!: number
    trialDayRegistrations!: number
    upcomingTrialDayRegistrations!: number
    trialDays!: number
}
