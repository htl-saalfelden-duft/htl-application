import { TabType } from "../contexts/tabs.context"
import { ContactType, ContactTypes } from "../models/contact.model"

const tabType2ContactType = (tabType: TabType): ContactTypes => {
    return tabType.replace('contact-', '') as ContactTypes
}

const contactType2Title = (contactType: ContactType): string => {
    return `Kontakt ${contactType?.title}`
}

const contactType2tabType = (contactType: ContactTypes): TabType => {
    return `contact-${contactType}`
}

export {tabType2ContactType,  contactType2tabType, contactType2Title}