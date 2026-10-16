import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Card, CardBody, Container } from "react-bootstrap"
import { ApiService } from "../services/api.service"
import { TrialDay } from "../models/trialDay.model"
import { useAuth } from "../contexts/auth.context"
import Navigationbar from "./Navbar"
import { TrialDayList, TrialDays } from "./TrialDays"
import htlLogo128 from '../assets/images/htl-logo.png'

const SIGN_IN_URL = '/signin-applicant?redirect=/trial-days'
const SIGN_UP_URL = '/signup-applicant'

// Trial days without login, e.g. linked or embedded (?embed=1) on the school website
const PublicTrialDays = ({ embed }: { embed: boolean }) => {
    const apiService = useMemo(() => new ApiService(), [])
    const navigate = useNavigate()
    const [trialDays, setTrialDays] = useState<TrialDay[]>()

    useEffect(() => {
        apiService.getPath<TrialDay[]>(TrialDay, 'public').then(setTrialDays)
    }, [apiService])

    // Inside an iframe the portal opens in a new tab
    const link = (url: string) => embed
        ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
        : { onClick: () => navigate(url) }

    return (
        <Container className={embed ? 'py-2' : ''}>
            {!embed &&
                <Card className="mt-5 mb-4">
                    <CardBody>
                        <div className="d-flex flex-row-reverse">
                            <img src={htlLogo128} width={64} alt="htl-logo" />
                            <h5 className="card-title mt-4 flex-grow-1">HTL-Bewerber-Portal - Schnuppertage</h5>
                        </div>
                        <p className="mt-3">Lernen Sie unsere Fachrichtungen bei einem Schnuppertag kennen! Für die Anmeldung benötigen Sie ein Konto im Bewerber-Portal. Mit diesem Konto können Sie sich später auch online bewerben.</p>
                        <div className="d-flex" style={{ gap: '6px' }}>
                            <Button variant="outline-primary" {...link(SIGN_IN_URL)}>Einloggen</Button>
                            <Button variant="link" {...link(SIGN_UP_URL)}>Zugang beantragen</Button>
                        </div>
                    </CardBody>
                </Card>
            }
            {trialDays &&
                <TrialDayList trialDays={trialDays} renderAction={trialDay =>
                    trialDay.bookable
                        ? <Button size="sm" variant="outline-primary" {...link(SIGN_IN_URL)}>Anmelden</Button>
                        : <small className="text-muted">Anmeldeschluss vorbei</small>
                } />
            }
        </Container>
    )
}

// Signed-in applicants get the full page with their registrations, everyone else the public list
export const TrialDaysRoute = () => {
    const { isSignedIn, userType } = useAuth()
    const location = useLocation()
    const embed = new URLSearchParams(location.search).get('embed') === '1'

    if (isSignedIn && userType === 'applicant' && !embed) {
        return (
            <>
                <Navigationbar />
                <Container>
                    <TrialDays />
                </Container>
            </>
        )
    }
    return <PublicTrialDays embed={embed} />
}
