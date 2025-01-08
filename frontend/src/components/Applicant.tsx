import { useLocation } from "react-router-dom"
import { TabsProvider } from "../contexts/tabs.context"
import { ApplicationForm } from "./ApplicationForm"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/auth.context"

const Applicant = () => {
    const { state } = useLocation()
    const { currentUser } = useAuth()
    const [applicantID, setApplicantID] = useState<string>()
    let admin = !!state?.id

    useEffect(() => {
        if (state?.id) {
            setApplicantID(state.id)
        } else if (currentUser) {
            setApplicantID(currentUser?.id)
        }
    }, [currentUser])

    return (
        <TabsProvider admin={admin}>
            <ApplicationForm applicantID={applicantID as string} />
        </TabsProvider>
    )
}

export default Applicant