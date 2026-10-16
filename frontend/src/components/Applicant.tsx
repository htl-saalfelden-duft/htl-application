import { useLocation, useNavigate } from "react-router-dom"
import { Button, Card, CardBody } from "react-bootstrap"
import { TabsProvider } from "../contexts/tabs.context"
import { ApplicationForm } from "./ApplicationForm"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/auth.context"
import useApplicationOpen from "../hooks/useApplicationOpen"
import ApplicantTrialDays from "./ApplicantTrialDays"

const Applicant = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const applicationOpen = useApplicationOpen()
    const [applicantID, setApplicantID] = useState<string>()
    let administrationEdit = !!state?.id

    useEffect(() => {
        if (state?.id) {
            setApplicantID(state.id)
        } else if (currentUser) {
            setApplicantID(currentUser?.id)
        }
    }, [currentUser])

    // The lock only affects applicants, not the administration (SPEC 4.6)
    if (!administrationEdit && applicationOpen === undefined) {
        return null
    }
    if (!administrationEdit && !applicationOpen) {
        return (
            <Card className="mt-5">
                <CardBody>
                    <h5>Online-Bewerbung</h5>
                    <p>Die Online-Bewerbung ist noch nicht freigeschaltet. Melden Sie sich in der Zwischenzeit gerne zu einem Schnuppertag an.</p>
                    <Button variant="outline-primary" onClick={() => navigate("/trial-days")}>Zu den Schnuppertagen</Button>
                </CardBody>
            </Card>
        )
    }

    return (
        <>
            {administrationEdit && applicantID && <ApplicantTrialDays applicantID={applicantID} />}
            <TabsProvider administrationEdit={administrationEdit}>
                <ApplicationForm applicantID={applicantID as string} />
            </TabsProvider>
        </>
    )
}

export default Applicant
