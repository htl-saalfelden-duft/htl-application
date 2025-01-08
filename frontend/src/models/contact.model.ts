import { Entity } from "../common/decorators/entity.decorator"

interface Contact {
    title: string
    degree: string
    sufixDegree: string
    firstname: string
    moreFirstname: string
    lastname: string
    birthdate: string
    svnr: string
    country: string
    zip: string
    city: string
    street: string
    streetNr: string
    phone: string
    email: string
    legalGardian: boolean
    pupilInBoardingSchool: string
    primaryResidenz: string
    liableToPay: string
    decitionTo: string
    postTo: string
    annotation: string
    contactTypeKey: string
}
@Entity('contactType')
class ContactType {
    key!: string
    title!: string
}

type ContactTypes = 
    'applicant' | 
    'father' | 
    'mother'

export type {ContactTypes, Contact}
export { ContactType }
