import { Form, Tab, Tabs } from "react-bootstrap"
import { ApplicationTab, TabType, useTabs } from "../contexts/tabs.context"
import { HouseFill } from "react-bootstrap-icons"
import { HomeTab } from "./HomeTab"
import ApplicantDetails from "./ApplicantDetails"
import Contact from "./Contact"
import SchoolReport from "./SchoolReport"
import { FormProvider, useForm } from "react-hook-form"
import { Applicant } from "../models/applicant.model"
import { useEffect, useMemo } from "react"
import { ApiService } from "../services/api.service"
import { useAuth } from "../contexts/auth.context"
import { ContactType } from "../models/contact.model"
import { contactType2tabType, isContactTab, tabType2ContactType } from "../common/tab.utils"
import { toast } from "react-toastify"
import { Applications } from "./Applications"
import { getDBApplicant, setDefaultApplication, setDefaultApplicationStatus } from "../common/applicant-data.utils"

const FormTabs = () => {
    const {
        tabs,
        setTabs,
        currentTab,
        setCurrentTab
    } = useTabs()

    const apiService = useMemo(() => new ApiService(), [])
    const { currentApplicant } = useAuth()
    const formMethods = useForm<Applicant>()

    const setAppTabs = (applicant: Applicant) => {

        const currentTabs = [...tabs]
        applicant.contacts?.forEach(c => {
            const tab = currentTabs.find(t => t.type === contactType2tabType(c.contactTypeKey as ContactType))
            tab!.active = true
        })

        // if(applicant.schoolReport) {
        //     const tab = currentTabs.find(t => t.type === 'schoolReport')
        //     tab!.active = true
        // }
        setTabs(currentTabs)
    }

    useEffect(() => {
        if (currentApplicant) {
            apiService.get<Applicant>(Applicant, currentApplicant?.id)
                .then(applicant => {
                    setAppTabs(applicant)
                    setDefaultApplication(applicant)
                    formMethods.reset(applicant)
                })
        }
    }, [currentApplicant])


    const onSubmit = formMethods.handleSubmit((applicant) => {

        setDefaultApplicationStatus(applicant, 'applied')
        const dbApplicant = getDBApplicant(applicant)

        console.log(dbApplicant)

        apiService.save<Applicant>(Applicant, dbApplicant).then(() => {
            toast("Daten wurden erfolgreich gesendet", {type: 'success'})
        })
    })

    const onSave = () => {
        const applicant = formMethods.getValues()

        setDefaultApplicationStatus(applicant, 'created')
        const dbApplicant = getDBApplicant(applicant)

        apiService.save<Applicant>(Applicant, dbApplicant)
        .then(() => {
            toast("Daten wurden gespeichert!", {type: 'success'})
        })
    }

    const mapTab = (tab: ApplicationTab, index: number) => {
        if(isContactTab(tab.type) && tab.active) {
            const type = tabType2ContactType(tab.type)

            return (
                <Tab key={tab.type} eventKey={tab.type} title={tab.title}>
                    <Contact type={type as ContactType} index={index} parent={tab.parent} require={true} />
                </Tab>
            )
        }
        if(tab.type === "schoolReport" && tab.active) {
            return (
                <Tab key={tab.type} eventKey="schoolReport" title="Schulnoten">
                    <SchoolReport />
                </Tab>
            )
        }
    }

    const activeOptionalTabs = tabs.filter(t => t.active)

    return (
        <FormProvider {...formMethods} >
            <Form onSubmit={onSubmit} className="mb-3">
                <Tabs
                    className="mt-3 mb-4"
                    activeKey={currentTab}
                    onSelect={(tab) => setCurrentTab(tab as TabType)}>

                    <Tab eventKey="home" title={<HouseFill size={20} />}>
                        <HomeTab onSave={onSave}/>
                    </Tab>

                    <Tab eventKey="applications" title="Bewerbungen" >
                        <Applications />
                    </Tab>

                    <Tab eventKey="details" title="Daten-Bewerber">
                        <ApplicantDetails />
                    </Tab>

                    { activeOptionalTabs.map((tab, index) => mapTab(tab, index))}                
                </Tabs>
            </Form>
        </FormProvider>
    )
}

export default FormTabs