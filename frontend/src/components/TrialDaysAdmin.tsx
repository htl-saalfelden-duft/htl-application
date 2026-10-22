import { Fragment, useEffect, useMemo, useState } from "react"
import { Badge, Button, Card, CardBody, Form, Row, Table } from "react-bootstrap"
import { ChevronDown, ChevronRight, Pencil, PersonPlus, PlusLg, Trash } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { ApiService } from "../services/api.service"
import { Applicant } from "../models/applicant.model"
import { SchoolClass } from "../models/schoolClass.model"
import { formatDateTime, formatTrialDayDate, formatTrialDayTime, guardianContactTypeTitles, TrialDay, TrialDayRegistration } from "../models/trialDay.model"
import TrialDayEdit from "./modal/TrialDayEdit"
import TrialDayParticipantNew from "./modal/TrialDayParticipantNew"
import DeleteConfirmation from "./modal/DeleteConfirmation"
import Confirmation from "./modal/Confirmation"
import { PhotoConsent, RegistrationStatus } from "./TrialDays"

// Answers to the extra question among active registrations, e.g. seats needed on the bus
const countYes = (registrations: TrialDayRegistration[]) =>
    registrations.filter(r => r.statusKey !== 'cancelled' && r.extraAnswer === true).length

export const TrialDaysAdmin = () => {
    const apiService = useMemo(() => new ApiService(), [])
    const navigate = useNavigate()

    const [trialDays, setTrialDays] = useState<TrialDay[]>([])
    const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([])
    const [schoolClassFilter, setSchoolClassFilter] = useState('')
    const [showPast, setShowPast] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [editTrialDay, setEditTrialDay] = useState<TrialDay>()
    const [deleteTrialDayID, setDeleteTrialDayID] = useState<string>()
    const [openTrialDayID, setOpenTrialDayID] = useState<string>()
    const [registrations, setRegistrations] = useState<TrialDayRegistration[]>([])
    const [showCancelled, setShowCancelled] = useState(false)
    const [participantTrialDay, setParticipantTrialDay] = useState<TrialDay>()
    const [cancelRegistration, setCancelRegistration] = useState<TrialDayRegistration>()

    const loadTrialDays = () => {
        apiService.get<TrialDay[]>(TrialDay, undefined, { schoolClass: schoolClassFilter || undefined, past: showPast })
            .then(setTrialDays)
    }

    const loadRegistrations = (trialDayID = openTrialDayID) => {
        if (trialDayID) {
            apiService.getPath<TrialDayRegistration[]>(TrialDay, `${trialDayID}/registrations`)
                .then(setRegistrations)
        }
    }

    useEffect(() => {
        apiService.get<SchoolClass[]>(SchoolClass).then(setSchoolClasses)
    }, [])

    useEffect(() => {
        loadTrialDays()
    }, [schoolClassFilter, showPast])

    const toggleParticipants = (trialDayID: string) => {
        if (openTrialDayID === trialDayID) {
            setOpenTrialDayID(undefined)
        } else {
            setRegistrations([])
            setOpenTrialDayID(trialDayID)
            loadRegistrations(trialDayID)
        }
    }

    const reload = () => {
        loadTrialDays()
        loadRegistrations()
    }

    const openEdit = (trialDay?: TrialDay) => {
        setEditTrialDay(trialDay)
        setShowEdit(true)
    }

    const deleteTrialDay = () => {
        apiService.delete(TrialDay, deleteTrialDayID!)
            .then(() => {
                toast('Termin gelöscht.')
                loadTrialDays()
            }, (err) => {
                toast(err.response.data.message, { type: 'error' })
            })
            .finally(() => setDeleteTrialDayID(undefined))
    }

    const cancel = () => {
        apiService.post(TrialDayRegistration, `${cancelRegistration!.id}/cancel`, {})
            .then(() => {
                toast('Anmeldung storniert, die Person wurde per E-Mail informiert.')
                reload()
            }, (err) => {
                toast(err.response.data.message, { type: 'error' })
            })
            .finally(() => setCancelRegistration(undefined))
    }

    const resendInvitation = (applicantID: string) => {
        apiService.post(Applicant, `${applicantID}/resend-invitation`, {})
            .then(() => toast('Einladung erneut gesendet.'), (err) => toast(err.response.data.message, { type: 'error' }))
    }

    const visibleRegistrations = registrations.filter(r => showCancelled || r.statusKey !== 'cancelled')

    return (
        <>
            <Row className='justify-content-md-center'>
                <div className="d-flex justify-content-between mt-5">
                    <h4>Schnuppertage</h4>
                    <div className="d-flex align-items-center mb-2" style={{ gap: '12px' }}>
                        <Form.Select size="sm" value={schoolClassFilter} onChange={e => setSchoolClassFilter(e.target.value)} style={{ width: 'auto' }}>
                            <option value="">Alle Fachrichtungen</option>
                            {schoolClasses.map(sc => <option key={sc.id} value={sc.id}>{sc.title}{sc.location ? ` – ${sc.location}` : ''}</option>)}
                        </Form.Select>
                        <Form.Check type="switch" id="showPast" label="vergangene anzeigen" checked={showPast} onChange={e => setShowPast(e.target.checked)} />
                        <Button variant="outline-secondary" onClick={() => openEdit()} title="Neuen Termin anlegen">
                            <PlusLg />
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardBody>
                        <Table hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Fachrichtung</th>
                                    <th>Standort</th>
                                    <th>Datum</th>
                                    <th>Uhrzeit</th>
                                    <th>Anmeldeschluss</th>
                                    <th>Angemeldet</th>
                                    <th>Warteliste</th>
                                    <th>Aktiv</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {trialDays.length === 0 && <tr><td colSpan={10} className="text-muted">Keine Termine.</td></tr>}
                                {trialDays.map(trialDay => (
                                    <Fragment key={trialDay.id}>
                                        <tr>
                                            <td>
                                                <Button size="sm" variant="link" onClick={() => toggleParticipants(trialDay.id!)} title="Teilnehmerliste">
                                                    {openTrialDayID === trialDay.id ? <ChevronDown /> : <ChevronRight />}
                                                </Button>
                                            </td>
                                            <td>{trialDay.displayName}</td>
                                            <td>{trialDay.location}</td>
                                            <td>{formatTrialDayDate(trialDay)}</td>
                                            <td>{formatTrialDayTime(trialDay)}</td>
                                            <td>{formatDateTime(trialDay.registrationDeadline)}</td>
                                            <td className={(trialDay.registeredCount ?? 0) > trialDay.maxParticipants ? 'text-danger' : ''}>
                                                {trialDay.registeredCount} / {trialDay.maxParticipants}
                                            </td>
                                            <td>{trialDay.waitingCount}</td>
                                            <td><div className="form-check"><input type="checkbox" className="form-check-input" checked={trialDay.active} disabled /></div></td>
                                            <td>
                                                <div className="d-flex" style={{ gap: '6px' }}>
                                                    <Button variant="outline-secondary" onClick={() => setParticipantTrialDay(trialDay)} title="Person anmelden"><PersonPlus /></Button>
                                                    <Button variant="outline-primary" onClick={() => openEdit(trialDay)} title="Termin bearbeiten"><Pencil /></Button>
                                                    <Button variant="danger" onClick={() => setDeleteTrialDayID(trialDay.id)} title="Termin löschen"><Trash /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {openTrialDayID === trialDay.id &&
                                            <tr>
                                                {/* maxWidth 0: the wide participant list scrolls on its own instead of widening the whole table */}
                                                <td colSpan={10} style={{ maxWidth: 0 }}>
                                                    <div className="d-flex justify-content-between">
                                                        <h6>Teilnehmerliste</h6>
                                                        <Form.Check type="switch" id="showCancelled" label="stornierte anzeigen" checked={showCancelled} onChange={e => setShowCancelled(e.target.checked)} />
                                                    </div>
                                                    {visibleRegistrations.length === 0
                                                        ? <p className="text-muted">Keine Anmeldungen.</p>
                                                        : <Table size="sm" responsive className="mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th>Name</th>
                                                                    <th>Adresse</th>
                                                                    <th>Schule / Klasse</th>
                                                                    <th>Erziehungsberechtigte:r</th>
                                                                    <th>Fotos</th>
                                                                    {trialDay.extraQuestion &&
                                                                        <th title={trialDay.extraQuestion}>{trialDay.extraQuestion} ({countYes(visibleRegistrations)} Ja)</th>}
                                                                    <th>Bemerkung</th>
                                                                    <th>Konto</th>
                                                                    <th>Status</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {visibleRegistrations.map(registration => (
                                                                    <tr key={registration.id} className={registration.statusKey === 'cancelled' ? 'text-muted' : ''}>
                                                                        <td>
                                                                            <Button size="sm" variant="link" className="p-0" onClick={() => navigate("/applicant", { state: { id: registration.applicantID } })}>
                                                                                {registration.applicant?.details?.firstname} {registration.applicant?.details?.lastname}
                                                                            </Button>
                                                                        </td>
                                                                        <td>{registration.street} {registration.streetNr}<br />{registration.zip} {registration.city}</td>
                                                                        <td>{registration.applicant?.details?.previousSchoolTxt}{registration.currentClass && `, ${registration.currentClass}`}</td>
                                                                        <td>
                                                                            {registration.guardianFirstname} {registration.guardianLastname}
                                                                            {registration.guardianContactTypeKey && <small className="text-muted"> ({guardianContactTypeTitles[registration.guardianContactTypeKey]})</small>}
                                                                            <br />{registration.guardianPhone}
                                                                            <br />{registration.guardianEmail}
                                                                        </td>
                                                                        <td><PhotoConsent registration={registration} /></td>
                                                                        {trialDay.extraQuestion &&
                                                                            <td>{registration.extraAnswer === true ? 'Ja' : registration.extraAnswer === false ? 'Nein' : '–'}</td>}
                                                                        <td style={{ whiteSpace: 'pre-line' }}>{registration.annotation}</td>
                                                                        <td>
                                                                            {registration.applicant?.email}
                                                                            {registration.applicant?.invitationPending &&
                                                                                <div>
                                                                                    <Badge bg="info" className="me-1">Einladung offen</Badge>
                                                                                    <Button size="sm" variant="link" className="p-0" onClick={() => resendInvitation(registration.applicantID)}>erneut senden</Button>
                                                                                </div>}
                                                                        </td>
                                                                        <td><RegistrationStatus registration={registration} /></td>
                                                                        <td>
                                                                            {registration.statusKey !== 'cancelled' &&
                                                                                <Button size="sm" variant="outline-danger" onClick={() => setCancelRegistration(registration)}>Stornieren</Button>}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    }
                                                </td>
                                            </tr>
                                        }
                                    </Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Row>
            <TrialDayEdit
                show={showEdit}
                trialDay={editTrialDay}
                onClose={() => setShowEdit(false)}
                onSaved={() => { setShowEdit(false); reload() }} />
            <TrialDayParticipantNew
                trialDay={participantTrialDay}
                onClose={() => setParticipantTrialDay(undefined)}
                onRegistered={() => { setParticipantTrialDay(undefined); reload() }} />
            <DeleteConfirmation
                show={!!deleteTrialDayID}
                entityName="Termin"
                onSubmit={deleteTrialDay}
                onClose={() => setDeleteTrialDayID(undefined)} />
            <Confirmation
                show={!!cancelRegistration}
                title="Anmeldung stornieren"
                text={`Anmeldung von ${cancelRegistration?.applicant?.details?.firstname ?? ''} ${cancelRegistration?.applicant?.details?.lastname ?? ''} stornieren? Die Person wird per E-Mail informiert, und die Warteliste rückt nach.`}
                confirmLabel="Stornieren"
                onSubmit={cancel}
                onClose={() => setCancelRegistration(undefined)} />
        </>
    )
}
