import React, {useContext, useState} from 'react'
import { INITIAL_CONTACT_TABS } from '../assets/data/initial-contact-tabs'
import { ContactType, ContactTypes } from '../models/contact.model'
import { contactType2Title, contactType2tabType } from '../common/tab.utils'

interface Props {
    children: any
    administrationEdit: boolean
}

interface ApplicationTab {
    title: string
    parent?: boolean
    type: TabType
    fixed?: true
}

type TabType = 'home' | 'details' | 'applications' | 'contact-applicant' | 'contact-father' | 'contact-mother' | 'schoolReport'

interface TabsValues {
    contactTabs: ApplicationTab[],
    setContactTabs: (tabs: ApplicationTab[]) => void
    addContactTab: (type: ContactType) => void
    removeContactTab: (index: number) => void

    schoolReportEnabled: boolean
    setSchoolReportEnabled: React.Dispatch<React.SetStateAction<boolean>>

    currentTab: string
    setCurrentTab: (type: TabType) => void

    administrationEdit: boolean
}

const TabsContext = React.createContext<TabsValues>(undefined as any )
const useTabs = () => useContext(TabsContext)

const TabsProvider = (props: Props) => {
    const [schoolReportEnabled, setSchoolReportEnabled] = useState(false)
    const [contactTabs, setContactTabs] = useState<ApplicationTab[]>(INITIAL_CONTACT_TABS);
    const [currentTab, setCurrentTab] = useState<TabType>('home');


    const addContactTab = (contactType: ContactType) => {
        setContactTabs(currentContactTabs => {
            const contactTabs = [...currentContactTabs]
            contactTabs.push({
                type: contactType2tabType(contactType.key as ContactTypes) as TabType,
                title: contactType2Title(contactType),
                parent: true,
            })
            return contactTabs
        }) 
    }

    const removeContactTab = (index: number) => {
        setContactTabs(currentContactTabs => {
            const contactTabs = [...currentContactTabs]
            contactTabs.splice(index, 1)
            return contactTabs
        }) 
    }

    const value = {
        contactTabs,
        setContactTabs,
        addContactTab,
        removeContactTab,

        schoolReportEnabled,
        setSchoolReportEnabled,

        currentTab,
        setCurrentTab,
        administrationEdit: props.administrationEdit
    }

    return (
        <TabsContext.Provider value={value}>{props.children}</TabsContext.Provider>
    )
}

export { TabsProvider, useTabs, type TabType, type ApplicationTab }
