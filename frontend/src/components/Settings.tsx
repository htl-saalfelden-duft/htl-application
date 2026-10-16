import { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Form, Row } from "react-bootstrap"
import { ExclamationTriangle } from "react-bootstrap-icons"
import { toast } from "react-toastify"
import { ApiService } from "../services/api.service"
import { ApplicationPhase, Setting } from "../models/setting.model"

const CLOSE_CONFIRMATION = 'ABSCHLIESSEN'

// Admin only (SPEC 4.6, 4.10)
export const Settings = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const [applicationOpen, setApplicationOpen] = useState<boolean>()
    const [preview, setPreview] = useState<ApplicationPhase>()
    const [confirmation, setConfirmation] = useState('')
    const [closing, setClosing] = useState(false)

    const load = () => {
        apiService.getPath<Setting>(Setting, 'applicationOpen').then(setting => setApplicationOpen(setting.value))
        apiService.getPath<ApplicationPhase>(ApplicationPhase, 'close/preview').then(setPreview)
    }

    useEffect(() => {
        load()
    }, [])

    const toggleApplicationOpen = (value: boolean) => {
        apiService.patch<Setting>(Setting, 'applicationOpen', { value })
            .then(setting => {
                setApplicationOpen(setting.value)
                toast(setting.value ? 'Online-Bewerbung freigeschaltet.' : 'Online-Bewerbung gesperrt.')
            }, (err) => toast(err.response.data.message, { type: 'error' }))
    }

    const closePhase = () => {
        setClosing(true)
        apiService.post<ApplicationPhase>(ApplicationPhase, 'close', { confirmation })
            .then(result => {
                toast(`Bewerbungsphase abgeschlossen: ${result.applicantsToDelete} Konten gelöscht, ${result.applicantsToAnonymize} Bewerbungen anonymisiert.`, { type: 'success', autoClose: 1E4 })
                setConfirmation('')
                load()
            }, (err) => toast(err.response.data.message, { type: 'error' }))
            .finally(() => setClosing(false))
    }

    return (
        <Row className='justify-content-md-center'>
            <h4 className="mt-5">Einstellungen</h4>

            <Card className="mb-4">
                <CardBody>
                    <h5>Online-Bewerbung</h5>
                    <Form.Check
                        type="switch"
                        id="applicationOpen"
                        label={applicationOpen ? 'freigeschaltet – Bewerber:innen können das Bewerbungsformular ausfüllen' : 'gesperrt – Bewerber:innen können sich nur zu Schnuppertagen anmelden'}
                        checked={!!applicationOpen}
                        disabled={applicationOpen === undefined}
                        onChange={e => toggleApplicationOpen(e.target.checked)} />
                    <Form.Text muted>Betrifft nur die Ansicht der Bewerber:innen. Die Verwaltung kann jederzeit alle Daten bearbeiten.</Form.Text>
                </CardBody>
            </Card>

            <Card className="mb-4 border-danger">
                <CardBody>
                    <h5 className="text-danger"><ExclamationTriangle className="me-2" />Bewerbungsphase abschließen</h5>
                    <p>Diese Aktion kann <strong>nicht rückgängig</strong> gemacht werden. Sie</p>
                    <ul>
                        <li>sperrt die Online-Bewerbung,</li>
                        <li>löscht alle Schnuppertermine und Schnupper-Anmeldungen ({preview?.trialDays ?? '…'} Termine, {preview?.trialDayRegistrations ?? '…'} Anmeldungen),</li>
                        <li>löscht alle nicht abgegebenen Konten (Status „angelegt“): <strong>{preview?.applicantsToDelete ?? '…'}</strong>,</li>
                        <li>anonymisiert alle übrigen Bewerbungen: <strong>{preview?.applicantsToAnonymize ?? '…'}</strong>. Erhalten bleiben Wohnort (PLZ/Ort), Vorschule, Noten, Fachrichtungswünsche und Status.</li>
                    </ul>
                    {!!preview?.upcomingTrialDayRegistrations &&
                        <Alert variant="warning">Achtung: Es gibt noch {preview.upcomingTrialDayRegistrations} aktive Anmeldungen für zukünftige Schnuppertermine.</Alert>
                    }
                    <Alert variant="info">Haben Sie den Sokrates- und BTS-Export bereits durchgeführt? Anonymisierte Bewerbungen werden nicht mehr exportiert.</Alert>
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="closeConfirmation">Zur Bestätigung <strong>{CLOSE_CONFIRMATION}</strong> eingeben</Form.Label>
                        <Form.Control id="closeConfirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="off" style={{ maxWidth: '20em' }} />
                    </Form.Group>
                    <Button variant="danger" onClick={closePhase} disabled={confirmation !== CLOSE_CONFIRMATION || closing}>
                        Bewerbungsphase abschließen
                    </Button>
                </CardBody>
            </Card>
        </Row>
    )
}
