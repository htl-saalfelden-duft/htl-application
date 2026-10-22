import { Fragment, ReactNode, useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, Row, Table } from "react-bootstrap"
import { toast } from "react-toastify"
import { ApiService } from "../services/api.service"
import { Applicant } from "../models/applicant.model"
import {
    formatDateTime, formatTrialDayDate, formatTrialDayTime, sharesDepartment,
    TrialDay, TrialDayRegistration, trialDayRegistrationStatusTitles
} from "../models/trialDay.model"
import TrialDayRegister from "./modal/TrialDayRegister"
import TrialDayRebook from "./modal/TrialDayRebook"
import Confirmation from "./modal/Confirmation"

const isActive = (registration: TrialDayRegistration) => registration.statusKey !== 'cancelled'

export const RegistrationStatus = ({ registration }: { registration: TrialDayRegistration }) => {
    const variant = { registered: 'success', waiting: 'warning', cancelled: 'secondary' }[registration.statusKey]
    return (
        <Badge bg={variant}>
            {trialDayRegistrationStatusTitles[registration.statusKey]}
            {registration.waitingPosition ? ` (Platz ${registration.waitingPosition})` : ''}
        </Badge>
    )
}

interface TrialDayListProps {
    trialDays: TrialDay[]
    renderAction: (trialDay: TrialDay) => ReactNode
}

// Trial days grouped by location, then by display name; groups keep the order
// of their first trial day. Also used on the public page
export const TrialDayList = ({ trialDays, renderAction }: TrialDayListProps) => {
    const trialDaysByLocation = trialDays.reduce((groups, trialDay) => {
        const location = trialDay.location ?? ''
        const title = trialDay.displayName ?? ''
        const byTitle = groups[location] = groups[location] ?? {}
        byTitle[title] = [...(byTitle[title] ?? []), trialDay]
        return groups
    }, {} as Record<string, Record<string, TrialDay[]>>)

    if (trialDays.length === 0) {
        return <Alert variant="info">Derzeit sind keine Schnuppertermine verfügbar.</Alert>
    }

    return (
        <>
            {Object.entries(trialDaysByLocation).map(([location, trialDaysByTitle]) => (
                <Fragment key={location}>
                    {location && <h5 className="mt-4 mb-3 pb-1 border-bottom">{location}</h5>}
                    {Object.entries(trialDaysByTitle).map(([title, days]) => (
                        <Card className="mb-4" key={title}>
                            <CardBody>
                                <h5>{title}</h5>
                                <Table responsive className="mb-0">
                                    <tbody>
                                        {days.map(trialDay => {
                                            const free = trialDay.maxParticipants - (trialDay.registeredCount ?? 0)
                                            return (
                                                <tr key={trialDay.id}>
                                                    <td style={{ width: '30%' }}>
                                                        <strong>{formatTrialDayDate(trialDay)}</strong><br />
                                                        {formatTrialDayTime(trialDay)}
                                                    </td>
                                                    <td>
                                                        {trialDay.description && <div style={{ whiteSpace: 'pre-line' }}>{trialDay.description}</div>}
                                                        <small className="text-muted">Anmeldeschluss: {formatDateTime(trialDay.registrationDeadline)}</small>
                                                    </td>
                                                    <td style={{ width: '20%' }}>
                                                        {free > 0
                                                            ? <span className="text-success">{free} {free === 1 ? 'Platz' : 'Plätze'} frei</span>
                                                            : <span className="text-warning">ausgebucht – Warteliste</span>}
                                                    </td>
                                                    <td className="text-end" style={{ width: '15%' }}>
                                                        {renderAction(trialDay)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    ))}
                </Fragment>
            ))}
        </>
    )
}

// Prominent for the teachers: who must not be photographed (SPEC 4.10a)
export const PhotoConsent = ({ registration }: { registration: TrialDayRegistration }) =>
    registration.photoConsent === undefined || registration.photoConsent === null
        ? <span className="text-muted">–</span>
        : registration.photoConsent
            ? <Badge bg="light" text="dark">Fotos ok</Badge>
            : <Badge bg="danger">keine Fotos</Badge>

export const TrialDays = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const [trialDays, setTrialDays] = useState<TrialDay[]>([])
    const [registrations, setRegistrations] = useState<TrialDayRegistration[]>([])
    const [applicant, setApplicant] = useState<Applicant>()
    const [registerTrialDay, setRegisterTrialDay] = useState<TrialDay>()
    const [rebookRegistration, setRebookRegistration] = useState<TrialDayRegistration>()
    const [cancelRegistration, setCancelRegistration] = useState<TrialDayRegistration>()

    const load = () => {
        apiService.get<TrialDay[]>(TrialDay).then(setTrialDays)
        apiService.getPath<TrialDayRegistration[]>(TrialDayRegistration, 'mine').then(setRegistrations)
        apiService.getPath<Applicant>(Applicant, 'current').then(setApplicant)
    }

    useEffect(() => {
        load()
    }, [])

    const cancel = () => {
        apiService.post(TrialDayRegistration, `${cancelRegistration!.id}/cancel`, {})
            .then(() => {
                toast("Die Anmeldung wurde storniert. Sie erhalten eine Bestätigung per E-Mail.", { type: 'success' })
                setCancelRegistration(undefined)
                load()
            }, (err) => {
                toast(err.response.data.message, { type: 'error' })
                setCancelRegistration(undefined)
            })
    }

    const onRegistered = () => {
        setRegisterTrialDay(undefined)
        setRebookRegistration(undefined)
        load()
    }

    // Only one active registration per department; joint trial days count for all of theirs (SPEC 4.11)
    const alreadyRegistered = (trialDay: TrialDay) =>
        registrations.some(registration => isActive(registration) && sharesDepartment(registration.trialDay, trialDay))

    return (
        <>
            <Row className='justify-content-md-center'>
                <h4 className="mt-5">Schnuppertage</h4>
                <p>Lernen Sie unsere Fachrichtungen bei einem Schnuppertag kennen! Sie können sich für jede Fachrichtung zu einem Termin anmelden.</p>

                {registrations.length > 0 &&
                    <Card className="mb-4">
                        <CardBody>
                            <h5>Meine Anmeldungen</h5>
                            <Table responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Fachrichtung</th>
                                        <th>Datum</th>
                                        <th>Uhrzeit</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map(registration => (
                                        <tr key={registration.id} className={isActive(registration) ? '' : 'text-muted'}>
                                            <td>{registration.trialDay?.displayName}</td>
                                            <td>{formatTrialDayDate(registration.trialDay!)}</td>
                                            <td>{formatTrialDayTime(registration.trialDay!)}</td>
                                            <td><RegistrationStatus registration={registration} /></td>
                                            <td className="text-end">
                                                {registration.changeable &&
                                                    <div className="d-flex justify-content-end" style={{ gap: '6px' }}>
                                                        <Button size="sm" variant="outline-primary" onClick={() => setRebookRegistration(registration)}>Umbuchen</Button>
                                                        <Button size="sm" variant="outline-danger" onClick={() => setCancelRegistration(registration)}>Stornieren</Button>
                                                    </div>
                                                }
                                                {isActive(registration) && !registration.changeable &&
                                                    <small className="text-muted">Änderungen bitte direkt bei der Schule</small>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                }

                <TrialDayList trialDays={trialDays} renderAction={trialDay =>
                    alreadyRegistered(trialDay)
                        ? <small className="text-muted">bereits angemeldet</small>
                        : trialDay.bookable
                            ? <Button size="sm" variant="outline-primary" onClick={() => setRegisterTrialDay(trialDay)}>Anmelden</Button>
                            : <small className="text-muted">Anmeldeschluss vorbei</small>
                } />
            </Row>
            <TrialDayRegister
                trialDay={registerTrialDay}
                applicant={applicant}
                onClose={() => setRegisterTrialDay(undefined)}
                onRegistered={onRegistered} />
            <TrialDayRebook
                registration={rebookRegistration}
                trialDays={trialDays}
                onClose={() => setRebookRegistration(undefined)}
                onRebooked={onRegistered} />
            <Confirmation
                show={!!cancelRegistration}
                title="Anmeldung stornieren"
                text={`Wollen Sie die Anmeldung zum Schnuppertag ${cancelRegistration?.trialDay?.displayName ?? ''} am ${cancelRegistration ? formatTrialDayDate(cancelRegistration.trialDay!) : ''} wirklich stornieren?`}
                confirmLabel="Stornieren"
                onSubmit={cancel}
                onClose={() => setCancelRegistration(undefined)} />
        </>
    )
}
