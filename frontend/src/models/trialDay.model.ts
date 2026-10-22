import { Entity } from "../common/decorators/entity.decorator"
import { ApplicantDetails } from "./applicant-details.model"
import { SchoolClass } from "./schoolClass.model"

@Entity('trialDay')
export class TrialDay {
    id?: string
    schoolClassIDs!: string[]
    schoolClasses?: SchoolClass[]
    title?: string
    extraQuestion?: string
    startAt!: Date
    endAt!: Date
    maxParticipants!: number
    registrationDeadline!: Date
    description?: string
    active!: boolean
    // computed by the backend: title or the department titles joined
    displayName?: string
    // computed by the backend: location of the departments
    location?: string | null
    registeredCount?: number
    waitingCount?: number
    bookable?: boolean
}

@Entity('trialDayRegistration')
export class TrialDayRegistration {
    id!: string
    trialDayID!: string
    trialDay?: TrialDay
    applicantID!: string
    applicant?: { id: string, email: string, details?: ApplicantDetails, invitationPending: boolean }
    statusKey!: TrialDayRegistrationStatusKey
    currentClass?: string
    street?: string
    streetNr?: string
    zip?: string
    city?: string
    guardianContactTypeKey?: GuardianContactTypeKey
    guardianFirstname?: string
    guardianLastname?: string
    guardianPhone!: string
    guardianEmail?: string
    photoConsent?: boolean
    extraAnswer?: boolean | null
    annotation?: string
    createdBy!: 'applicant' | 'administration'
    createdAt!: Date
    cancelledAt?: Date
    cancelledBy?: 'applicant' | 'administration'
    // computed by the backend
    waitingPosition?: number | null
    changeable?: boolean
}

export type GuardianContactTypeKey = 'mother' | 'father' | 'others'

export const guardianContactTypeTitles: Record<GuardianContactTypeKey, string> = {
    mother: 'Mutter',
    father: 'Vater',
    others: 'Andere:r Erziehungsberechtigte:r'
}

// Joint trial days block every other trial day that shares a department (SPEC 4.11)
export const sharesDepartment = (a?: TrialDay, b?: TrialDay) =>
    !!a && !!b && a.schoolClassIDs.some(id => b.schoolClassIDs.includes(id))

export type TrialDayRegistrationStatusKey = 'registered' | 'waiting' | 'cancelled'

export const trialDayRegistrationStatusTitles: Record<TrialDayRegistrationStatusKey, string> = {
    registered: 'angemeldet',
    waiting: 'Warteliste',
    cancelled: 'storniert'
}

export const formatTrialDayDate = (trialDay: TrialDay) =>
    trialDay.startAt.toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })

export const formatTrialDayTime = (trialDay: TrialDay) =>
    `${formatTime(trialDay.startAt)} – ${formatTime(trialDay.endAt)} Uhr`

export const formatDateTime = (date: Date) =>
    `${date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${formatTime(date)} Uhr`

const formatTime = (date: Date) =>
    date.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
