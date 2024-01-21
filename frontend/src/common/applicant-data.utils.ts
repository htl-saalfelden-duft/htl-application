import { pick } from "lodash"
import { Applicant } from "../models/applicant.model"
import { Application, ApplicationStatusKey } from "../models/application.model"

const setApplicantContactRedundances = (applicant: Applicant) => {
    let applicantContactIndex = applicant.contacts?.findIndex(c => c.contactTypeKey === 'applicant')
    const applicantDetails = pick(applicant.details, ['firstname', 'lastname', 'birthdate', 'svnr'])
    applicant.contacts![applicantContactIndex!] = { ...applicant.contacts![applicantContactIndex!], ...applicantDetails, ...{ legalGardian: true } }

}

const setApplicationValues = (applicant: Applicant) => {
        applicant.applications!.forEach((application, index) => {
            delete application.applicantID
  
            application.schoolClassID = application.schoolClass?.id as string
            delete application.schoolClass

            application.priority = index +1
        })
}

const setDefaultApplicationStatus = (applicant: Applicant, applicationStatusKey: ApplicationStatusKey) => {
    applicant.applications!.forEach(application => {
        application.statusKey = applicationStatusKey
    })
}

const setDefaultApplication = (applicant: Applicant) => {
    const defaultApplications: Application[] = [
        {schoolClassID: ""},
        {schoolClassID: ""},
        {schoolClassID: ""}
    ]
    if(!applicant.applications?.length) {
        defaultApplications.forEach(da => {
            applicant.applications?.push(da)
        })
    }   
}

const getDBApplicant = (applicant: Applicant): Applicant => {
    const dbApplicant = structuredClone(applicant)

    //filter null values
    dbApplicant.contacts = dbApplicant.contacts?.filter((contact:any) => contact)

    setApplicantContactRedundances(dbApplicant)
    setApplicationValues(dbApplicant)
    return dbApplicant
}

const isApplicantApplied = (applicant: Applicant) => {
    let applied = true
    applicant.applications?.forEach(a => {
        if(a.statusKey !== 'applied') {
            applied = false
        }
    })
    return applied
}

export {setDefaultApplication, getDBApplicant, setDefaultApplicationStatus, isApplicantApplied}