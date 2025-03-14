import { Applicant, ContactType } from "@prisma/client"
import { BtsCsv } from "models/bts-csv.model"

export const transformApplicantsDataForSokratesCSV = (applicants: Applicant[]): [any[],string[]] => {
    const normApplicants = []
    const headerApplicant = new Set<string>()
    const headerContacts = new Set<string>()
    const headerSchoolReports = new Set<string>()
    const headerApplications = new Set<string>()

    applicants.forEach(applicant => {

        let normData = {
            statusKey: applicant.statusKey,
            email: applicant.email
        }

        addKeysToSet(headerApplicant, normData)

        //Details--------------------------------------
        const flatDetails = flatten(applicant.details)
        addKeysToSet(headerApplicant, flatDetails)

        normData = { ...normData, ...flatDetails }

        //Contacts--------------------------------------
        applicant.contacts.forEach(contact => {
            const pre = contact.contactTypeKey
            const flatContact = flatten(contact, pre)
            addKeysToSet(headerContacts, flatContact)

            normData = { ...normData, ...flatContact }
        })

        //SchoolReport--------------------------------------
        const flatSchoolRep = flatten(applicant.schoolReport)
        addKeysToSet(headerSchoolReports, flatSchoolRep)

        normData = { ...normData, ...flatSchoolRep }

        //Applications--------------------------------------
        applicant['applications'].forEach(application => {
            const pre = `subjectarea-prio${application.priority}`

            const rawApplication = {
                title: application.schoolClass.title
            }
            const flatApplication = flatten(rawApplication, pre)
            addKeysToSet(headerApplications, flatApplication)

            normData = { ...normData, ...flatApplication }
        })

        normApplicants.push(normData)
    })

    const header = [...headerApplicant, ...headerContacts, ...headerSchoolReports, ...headerApplications]

    return [normApplicants, header]
}

export const transformApplicantsDataForBtsCSV = (applicants: Applicant[], contactTypes: ContactType[]):[any[],string[]] => {
    const normApplicants = []
    let headerSet = new Set<string>()

    const getContactTypeTitle = (key: string): string => {
        const contactType = contactTypes.find(ct => `contact-${ct.key}` === key)
        return contactType?.title
    }

    const getPrioSfkz = (applicant: Applicant): string => {
        const prioAppl = applicant['applications'].find(a => a.priority == 1)
        return prioAppl.schoolClass.sfkz
    } 

    applicants.forEach(applicant => {

        let normData: BtsCsv = {
            externeID: applicant.id,
            Wahlnummer: 1,
            vorlaeufigeSFKZ: getPrioSfkz(applicant),
            StudentVorname: applicant.details.firstname,
            StudentNachname: applicant.details.lastname,
            Geburtsdatum: applicant.details.birthdate,
            Geschlecht: applicant.details.sex,
            //aktuelleSchulkennzahl: applicant.details.previousSchoolNum,
            StudentGeburtsort: applicant.details.placeOfBirth,
            Geburtsland: applicant.details.countryOfBirth,
            Staatsbuergerschaft: applicant.details.nationality,
            //Religionsbekenntnis: applicant.details.religion,
            Muttersprache: applicant.details.language,
            //Sozialversicherungsnummer: applicant.details.svnr,
            StudentEmail: applicant.email,
            //StudentTelefon: applicant.contacts[0].phone,
            AdresseTyp: getContactTypeTitle(applicant.contacts[1].contactTypeKey),
            AdresseVorname: applicant.contacts[1].firstname,
            AdresseNachname: applicant.contacts[1].lastname,
            AdresseErziehungsberechtigt: applicant.contacts[1].legalGardian || false,
            AdresseEmail: applicant.contacts[1].email,
            AdresseTelefon: applicant.contacts[1].phone,
            AdresseStrasse: `${applicant.contacts[1].street} ${applicant.contacts[1].streetNr}`,
            AdressePlz: applicant.contacts[1].zip,
            AdresseOrt: applicant.contacts[1].city,
            AdresseLand: applicant.contacts[1].country,
            // zweiteAdresse: applicant.contacts.length > 2,
            // zweiteAdresseTyp: getContactTypeTitle(applicant.contacts[2]?.contactTypeKey),
            // zweiteAdresseVorname: applicant.contacts[2]?.firstname,
            // zweiteAdresseNachname: applicant.contacts[2]?.lastname,
            // zweiteAdresseErziehungsberechtigt: applicant.contacts[2]?.legalGardian || false,
            // zweiteAdresseEmail: applicant.contacts[2]?.email,
            // zweiteAdresseTelefon: applicant.contacts[2]?.phone,
            // zweiteAdresseStrasse: applicant.contacts[2]?.street,
            // zweiteAdressePlz: applicant.contacts[2]?.zip,
            // zweiteAdresseOrt: applicant.contacts[2]?.city,
            // zweiteAdresseLand: applicant.contacts[2]?.country
        }

        addKeysToSet(headerSet, normData)

        normApplicants.push(normData)
    })

    const header = [...headerSet]

    return [normApplicants, header]
}

const flatten = (obj, pre?) => {
    return obj ? Object.keys(obj).reduce((a, c) => (a[`${pre ? pre + '-' : ''}${c}`] = obj[c], a), {}) : {}
}

const addKeysToSet = (set: Set<string>, obj: any): void => {
    const keys = Object.keys(obj)
    keys.forEach(k => {
        set.add(k)
    })
}