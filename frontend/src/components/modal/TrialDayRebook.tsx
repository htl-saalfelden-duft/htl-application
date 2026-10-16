import { Button, Form, Modal } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiService } from '../../services/api.service';
import { formatTrialDayDate, formatTrialDayTime, TrialDay, TrialDayRegistration } from '../../models/trialDay.model';

interface Props {
	registration?: TrialDayRegistration
	trialDays: TrialDay[]
	onClose: () => void
	onRebooked: () => void
}

const TrialDayRebook = (props: Props) => {
	const { registration, trialDays, onClose, onRebooked } = props

	const apiService = useMemo(() => new ApiService(), [])
	const [trialDayID, setTrialDayID] = useState('')

	// Only other bookable dates of the same department
	const options = trialDays.filter(td =>
		td.bookable && td.id !== registration?.trialDayID && td.schoolClassID === registration?.trialDay?.schoolClassID)

	const rebook = () => {
		apiService.post<TrialDayRegistration>(TrialDayRegistration, `${registration!.id}/rebook`, { trialDayID })
			.then((created) => {
				toast(created.statusKey === 'waiting'
					? "Umgebucht. Der neue Termin ist ausgebucht, Sie stehen auf der Warteliste."
					: "Sie wurden erfolgreich umgebucht.", { type: 'success' })
				onRebooked()
			}, (err) => {
				toast(err.response.data.message, { type: 'error' })
			})
	}

	return (
		<Modal show={!!registration} onShow={() => setTrialDayID('')} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Schnuppertag umbuchen</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{options.length === 0
					? <p>Für diese Fachrichtung gibt es derzeit keinen anderen buchbaren Termin.</p>
					: <Form.Group>
						<Form.Label htmlFor="trialDayID">Neuer Termin</Form.Label>
						<Form.Select id="trialDayID" value={trialDayID} onChange={e => setTrialDayID(e.target.value)}>
							<option value="">Bitte wählen</option>
							{options.map(td => (
								<option key={td.id} value={td.id}>
									{formatTrialDayDate(td)}, {formatTrialDayTime(td)}
									{(td.registeredCount ?? 0) >= td.maxParticipants ? ' (ausgebucht – Warteliste)' : ''}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-secondary" onClick={onClose}>
					Abbrechen
				</Button>
				<Button variant="outline-primary" onClick={rebook} disabled={!trialDayID}>
					Umbuchen
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default TrialDayRebook;
