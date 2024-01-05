import React, {useContext, useState} from 'react'
import { OPTIONAL_TABS } from '../assets/data/optional-tabs'

interface Props {
    children: any
}

interface ApplicationTab {
    title: string
    parent?: boolean
    active: boolean
    type: TabType
}

type TabType = 'home' | 'details' | 'applications' | 'contact-applicant' | 'contact-father' | 'contact-mother' | 'schoolReport'

interface TabsValues {
    tabs: ApplicationTab[],
    setTabs: (tabs: ApplicationTab[]) => void
    currentTab: string
    setCurrentTab: (type: TabType) => void
    setTabState: (value: TabType, active: boolean) => void
}

const TabsContext = React.createContext<TabsValues>(undefined as any )
const useTabs = () => useContext(TabsContext)

const TabsProvider = (props: Props) => {
    const [tabs, setTabs] = useState<ApplicationTab[]>(OPTIONAL_TABS);
    const [currentTab, setCurrentTab] = useState<TabType>('home');

    const setTabState = (type: TabType, active: boolean) => {
         setTabs(
            tabs.map(tab => 
                tab.type === type 
                ? {...tab, active }
                : tab)
        )
    }

    const value = {
        tabs,
        setTabs,
        currentTab,
        setCurrentTab,
        setTabState
    }

    return (
        <TabsContext.Provider value={value}>{props.children}</TabsContext.Provider>
    )
}

export { TabsProvider, useTabs, type TabType, type ApplicationTab }
