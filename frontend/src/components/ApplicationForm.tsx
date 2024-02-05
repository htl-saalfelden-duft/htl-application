import { Form, Tab, Tabs } from "react-bootstrap"
import { TabType, useTabs } from "../contexts/tabs.context"
import { HouseFill } from "react-bootstrap-icons"
import { HomeTab } from "./HomeTab"
import ApplicantDetails from "./ApplicantDetails"
import Contact from "./Contact"
import SchoolReport from "./SchoolReport"
import { FormProvider, useForm } from "react-hook-form"
import { Applicant } from "../models/applicant.model"
import { useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { ContactType, ContactTypes } from "../models/contact.model"
import { contactType2Title, contactType2tabType, tabType2ContactType } from "../common/tab.utils"
import { toast } from "react-toastify"
import { Applications } from "./Applications"
import { getDBApplicant, setApplicationStatus, setDefaultApplication } from "../common/applicant-data.utils"
import { useNavigate } from "react-router-dom"
import SubmitConfirmation from "./modal/SubmitConf"
import { useAuth } from "../contexts/auth.context"


interface Props {
    applicantID: string
}

const ApplicationForm = (props: Props) => {
    const { applicantID } = props

    const {
        contactTabs,
        setContactTabs,
        currentTab,
        setCurrentTab,
        admin,
        schoolReportEnabled
    } = useTabs()

    const { userType } = useAuth()

    const navigate = useNavigate()

    const apiService = useMemo(() => new ApiService(), [])
    const formMethods = useForm<Applicant>()
    const { reset, handleSubmit, getValues } = formMethods

    const [ showSubmitConfirmation, setShowSubmitConfirmation ] = useState(false)
    const [ isLocked, setIsLocked ] = useState(false)

    const enableContactTabs = (applicant: Applicant, contactTypes: ContactType[]) => {

        const currentTabs = [...contactTabs.filter(ct => ct.type === 'contact-applicant')]

        applicant.contacts?.forEach(c => {
            if(c.contactTypeKey !== 'contact-applicant') {
                const contactType = contactTypes.find(ct => ct.key === tabType2ContactType(c.contactTypeKey as TabType)) as ContactType

                currentTabs.push({
                    title: contactType2Title(contactType),
                    parent: true,
                    type: contactType2tabType(contactType?.key as ContactTypes)
                })
                setContactTabs(currentTabs)
            }
        })
    }

    useEffect(() => {
        let applicant: Applicant
        if(applicantID) {
            apiService.get<Applicant>(Applicant, applicantID)
            .then(_applicant => {
                applicant = _applicant
                return apiService.get<ContactType[]>(ContactType, undefined)
            })
            .then(contactTypes => {
                enableContactTabs(applicant, contactTypes)
                setDefaultApplication(applicant)
                reset(applicant)

                if(applicant.statusKey === 'applied') {
                    setIsLocked(!admin)
                }
            })
        }
    }, [applicantID])


    const onSubmit = handleSubmit(() => {
        if(userType === 'administration') {
            proceedSubmit()
        } else {
            setShowSubmitConfirmation(true)
        }
    })

    const proceedSubmit = () => {
        const applicant = getValues()

        setApplicationStatus(applicant, 'applied')
        applicant.statusKey = 'applied'

        const dbApplicant = getDBApplicant(applicant)

        console.log(dbApplicant)

        apiService.save<Applicant>(Applicant, dbApplicant)
        .then(() => {
            if(userType === 'applicant') {
                toast(
                    "Ihre Bewerbung wurde erfolgreich an uns übermittelt! Sie erhalten zusätzlich eine Bestätigung per Email.", 
                    {type: 'success', autoClose: 1E4}
                )
            } else {
                toast(
                    "Bewerberdaten gespeichert!", 
                    {type: 'success'}
                ) 
            }

            setShowSubmitConfirmation(false)

            if(admin) {
                navigate('/applicants')
            } else {
                setIsLocked(true)
            }
        })
    }

    const onSave = () => {
        const applicant = getValues()

        // This is only if administration would edit after applicant is applied AND applications added
        if(applicant.statusKey === 'applied') {
            setApplicationStatus(applicant, 'applied')
        }

        const dbApplicant = getDBApplicant(applicant)

        apiService.save<Applicant>(Applicant, dbApplicant)
        .then(() => {
            toast("Daten wurden gespeichert!", {type: 'success'})
            if(admin) {
                navigate('/applicants')
            }
        })
    }


    return (
        <FormProvider {...formMethods} >
            <Form onSubmit={onSubmit} className="mb-3">
                <Tabs
                    className="mt-3 mb-4"
                    activeKey={currentTab}
                    onSelect={(tab) => setCurrentTab(tab as TabType)}>

                    <Tab eventKey="home" title={<HouseFill size={20} />}>
                        <HomeTab onSave={onSave} locked={isLocked}/>
                    </Tab>

                    <Tab eventKey="applications" title="Bewerbungen" >
                        <fieldset disabled={isLocked}>
                            <Applications />
                        </fieldset>
                    </Tab>

                    <Tab eventKey="details" title="Daten-Bewerber">
                        <fieldset disabled={isLocked}>
                            <ApplicantDetails />
                        </fieldset>
                    </Tab>

                    { contactTabs.map((contactTab, index) => 
                        <Tab key={index} eventKey={contactTab.type} title={contactTab.title}>
                            <fieldset disabled={isLocked}>
                                <Contact type={contactTab.type as ContactTypes} index={index} parent={contactTab.parent} require={true} />
                            </fieldset>
                        </Tab>
                    )}

                    { admin && schoolReportEnabled &&
                    <Tab eventKey="schoolReport" title="Schulnoten">
                        <SchoolReport />
                    </Tab> }       
                </Tabs>
                <SubmitConfirmation show={showSubmitConfirmation} onSubmit={proceedSubmit} onClose={() => setShowSubmitConfirmation(false)} />
            </Form>
        </FormProvider>
    )
}

export { ApplicationForm }