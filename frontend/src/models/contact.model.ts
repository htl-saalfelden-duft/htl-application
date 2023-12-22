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
    contactTypeKey: string
}

type ContactType = 
    'applicant' | 
    'father' | 
    'mother'

export type {ContactType, Contact}
