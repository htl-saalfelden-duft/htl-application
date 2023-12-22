import { TabType } from "../contexts/tabs.context"
import { ContactType } from "../models/contact.model"

const tabType2ContactType = (tabType: TabType): ContactType => {
    return tabType.replace('contact-', '') as ContactType
}

const contactType2tabType = (contactType: ContactType): TabType => {
    return `contact-${contactType}`
}

const isContactTab = (type: TabType) => {
    return type.startsWith('contact-')
}

export {tabType2ContactType,  contactType2tabType, isContactTab}