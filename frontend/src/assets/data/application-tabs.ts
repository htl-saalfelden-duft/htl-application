import { ApplicationTab } from "../../contexts/tabs.context"

const APPLICATION_TABS: ApplicationTab[] = [
    {
        title: "Kontakt-Bewerber",
        type: "contact-applicant",
        parent: false,
        active: true,
    },
    {
        title: "Kontakt-Vater",
        type: "contact-father",
        parent: true,
        active: true,
    },
    {
        title: "Kontakt-Mutter",
        type: "contact-mother",
        parent: true,
        active: false,
    },
    {
        title: "Schulnoten",
        type: "schoolReport",
        active: false
    }
]

export { APPLICATION_TABS }