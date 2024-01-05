import { pick } from "lodash"
import { Applicant } from "../models/applicant.model"
import { ApplicationStatusKey } from "../models/application.model"

const setApplicantContactRedundances = (applicant: Applicant) => {
    let applicantContactIndex = applicant.contacts?.findIndex(c => c.contactTypeKey === 'applicant')
    const applicantDetails = pick(applicant.details, ['firstname', 'lastname', 'birthdate', 'svnr'])
    applicant.contacts![applicantContactIndex!] = { ...applicant.contacts![applicantContactIndex!], ...applicantDetails, ...{ legalGardian: true } }

}

const setApplicationValues = (applicant: Applicant) => {
        applicant.applications!.forEach(application => {
            delete application.applicantID
  
            application.schoolClassID = application.schoolClass!.id
            delete application.schoolClass
        })
}

const setDefaultApplicationStatus = (applicant: Applicant, applicationStatusKey: ApplicationStatusKey) => {
    applicant.applications!.forEach(application => {
        application.statusKey = applicationStatusKey
    })
}

const setDefaultApplication = (applicant: Applicant) => {
    if(!applicant.applications?.length) {
        applicant.applications?.push({priority: 1, schoolClassID: ""})
    }   
}

const getDBApplicant = (applicant: Applicant): Applicant => {
    const dbApplicant = structuredClone(applicant)

    setApplicantContactRedundances(dbApplicant)
    setApplicationValues(dbApplicant)
    return dbApplicant
}

export {setDefaultApplication, getDBApplicant, setDefaultApplicationStatus}