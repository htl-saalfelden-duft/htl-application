import { useEffect, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, CardBody, Row, Table } from "react-bootstrap"
import { toast } from "react-toastify"
import { ApiService } from "../services/api.service"
import { Applicant } from "../models/applicant.model"
import {
    formatDateTime, formatTrialDayDate, formatTrialDayTime,
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

    // Only one active registration per department (SPEC 4.1)
    const registeredSchoolClassIDs = new Set(registrations.filter(isActive).map(r => r.trialDay?.schoolClassID))

    const trialDaysBySchoolClass = trialDays.reduce((groups, trialDay) => {
        const title = trialDay.schoolClass?.title ?? ''
        groups[title] = [...(groups[title] ?? []), trialDay]
        return groups
    }, {} as Record<string, TrialDay[]>)

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
                                            <td>{registration.trialDay?.schoolClass?.title}</td>
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

                {trialDays.length === 0 &&
                    <Alert variant="info">Derzeit sind keine Schnuppertermine verfügbar.</Alert>
                }

                {Object.entries(trialDaysBySchoolClass).map(([title, days]) => (
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
                                                    {registeredSchoolClassIDs.has(trialDay.schoolClassID)
                                                        ? <small className="text-muted">bereits angemeldet</small>
                                                        : trialDay.bookable
                                                            ? <Button size="sm" variant="outline-primary" onClick={() => setRegisterTrialDay(trialDay)}>Anmelden</Button>
                                                            : <small className="text-muted">Anmeldeschluss vorbei</small>}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                ))}
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
                text={`Wollen Sie die Anmeldung zum Schnuppertag ${cancelRegistration?.trialDay?.schoolClass?.title ?? ''} am ${cancelRegistration ? formatTrialDayDate(cancelRegistration.trialDay!) : ''} wirklich stornieren?`}
                confirmLabel="Stornieren"
                onSubmit={cancel}
                onClose={() => setCancelRegistration(undefined)} />
        </>
    )
}
