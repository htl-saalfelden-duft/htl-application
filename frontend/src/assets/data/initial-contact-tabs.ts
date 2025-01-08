import { ApplicationTab } from "../../contexts/tabs.context"

const INITIAL_CONTACT_TABS: ApplicationTab[] = [
    {
        title: "Kontakt-Bewerber",
        type: "contact-applicant",
        parent: false,
        fixed: true
    },
    {
        title: "Kontakt-Vater",
        type: "contact-father",
        parent: true
    },
    {
        title: "Kontakt-Mutter",
        type: "contact-mother",
        parent: true
    }
]

export { INITIAL_CONTACT_TABS }