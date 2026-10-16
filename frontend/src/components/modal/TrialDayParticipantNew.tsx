import { useForm } from 'react-hook-form';
import { Alert, Button, ButtonGroup, Form, ListGroup, Modal, ToggleButton } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { uniqBy } from 'lodash';
import { ApiService } from '../../services/api.service';
import { Applicant } from '../../models/applicant.model';
import { formatTrialDayDate, formatTrialDayTime, TrialDay, TrialDayRegistration } from '../../models/trialDay.model';

interface Props {
	trialDay?: TrialDay
	onClose: () => void
	onRegistered: () => void
}

interface ParticipantFormInput {
	email: string
	firstname: string
	lastname: string
	school: string
	currentClass: string
	guardianPhone: string
	annotation: string
	overbook: boolean
}

// Registration by the administration, e.g. after a phone call (SPEC 4.5)
const TrialDayParticipantNew = (props: Props) => {
	const { trialDay, onClose, onRegistered } = props

	const apiService = useMemo(() => new ApiService(), [])
	const [mode, setMode] = useState<'existing' | 'new'>('existing')
	const [search, setSearch] = useState('')
	const [results, setResults] = useState<Applicant[]>([])
	const [selected, setSelected] = useState<Applicant>()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ParticipantFormInput>({ shouldUnregister: true })

	const full = !!trialDay && (trialDay.registeredCount ?? 0) >= trialDay.maxParticipants

	const handleShow = () => {
		setMode('existing')
		setSearch('')
		setResults([])
		setSelected(undefined)
		reset({ email: '', firstname: '', lastname: '', school: '', currentClass: '', guardianPhone: '', annotation: '', overbook: false })
	}

	// Pure trial day accounts are hidden from the default list, so search both
	const searchApplicants = () => {
		Promise.all([
			apiService.get<Applicant[]>(Applicant, undefined, { search }),
			apiService.get<Applicant[]>(Applicant, undefined, { search, onlyTrial: true })
		]).then(([applicants, trialOnly]) => setResults(uniqBy([...applicants, ...trialOnly], 'id')))
	}

	const onFormSubmit = handleSubmit((data) => {
		const { email, firstname, lastname, ...rest } = data
		const body = mode === 'existing'
			? { applicantID: selected?.id, ...rest }
			: { email, firstname, lastname, ...rest }

		return apiService.post<TrialDayRegistration>(TrialDay, `${trialDay!.id}/registrations`, body)
			.then((registration) => {
				toast(registration.statusKey === 'waiting' ? "Auf die Warteliste gesetzt." : "Angemeldet.", { type: 'success' })
				onRegistered()
			}, (err) => {
				toast(err.response.data.message, { type: 'error' })
			})
	})

	return (
		<Modal show={!!trialDay} onShow={handleShow} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Person anmelden</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit} autoComplete='off'>
				<Modal.Body>
					{trialDay && <p><strong>{trialDay.schoolClass?.title}</strong> – {formatTrialDayDate(trialDay)}, {formatTrialDayTime(trialDay)}</p>}

					<ButtonGroup className="mb-3">
						<ToggleButton id="mode-existing" type="radio" variant="outline-secondary" value="existing" checked={mode === 'existing'} onChange={() => setMode('existing')}>Bestehendes Konto</ToggleButton>
						<ToggleButton id="mode-new" type="radio" variant="outline-secondary" value="new" checked={mode === 'new'} onChange={() => setMode('new')}>Neue Person</ToggleButton>
					</ButtonGroup>

					{mode === 'existing' &&
						<div className="mb-3">
							<div className="d-flex" style={{ gap: '6px' }}>
								<Form.Control value={search} onChange={e => setSearch(e.target.value)} placeholder="Name oder E-Mail" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchApplicants() } }} />
								<Button variant="outline-secondary" onClick={searchApplicants}>Suchen</Button>
							</div>
							<ListGroup className="mt-2">
								{results.map(applicant => (
									<ListGroup.Item key={applicant.id} action active={selected?.id === applicant.id} onClick={() => setSelected(applicant)}>
										{applicant.details?.firstname} {applicant.details?.lastname} <small>({applicant.email})</small>
									</ListGroup.Item>
								))}
							</ListGroup>
						</div>
					}

					{mode === 'new' && <>
						<Form.Group className="mb-3">
							<Form.Label htmlFor="email">E-Mail-Adresse *</Form.Label>
							<Form.Control type="email" {...register("email", { required: mode === 'new' && "Bitte E-Mail eingeben" })} id="email" isInvalid={!!errors.email} />
							<Form.Text muted>Existiert noch kein Konto, wird eines angelegt und eine Einladung zum Festlegen des Passworts verschickt.</Form.Text>
						</Form.Group>
						<div className="row">
							<Form.Group className="mb-3 col-md-6">
								<Form.Label htmlFor="firstname">Vorname *</Form.Label>
								<Form.Control {...register("firstname", { required: mode === 'new' && "Bitte Vorname eingeben" })} id="firstname" isInvalid={!!errors.firstname} />
							</Form.Group>
							<Form.Group className="mb-3 col-md-6">
								<Form.Label htmlFor="lastname">Nachname *</Form.Label>
								<Form.Control {...register("lastname", { required: mode === 'new' && "Bitte Nachname eingeben" })} id="lastname" isInvalid={!!errors.lastname} />
							</Form.Group>
						</div>
					</>}

					<div className="row">
						<Form.Group className="mb-3 col-md-8">
							<Form.Label htmlFor="school">Aktuelle Schule</Form.Label>
							<Form.Control {...register("school")} id="school" />
						</Form.Group>
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="currentClass">Klasse</Form.Label>
							<Form.Control {...register("currentClass")} id="currentClass" />
						</Form.Group>
					</div>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="guardianPhone">Telefon Erziehungsberechtigte:r *</Form.Label>
						<Form.Control type="tel" {...register("guardianPhone", { required: "Bitte Telefonnummer eingeben" })} id="guardianPhone" isInvalid={!!errors.guardianPhone} />
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="annotation">Bemerkung</Form.Label>
						<Form.Control as="textarea" rows={2} {...register("annotation")} id="annotation" />
					</Form.Group>
					{full && <>
						<Alert variant="warning" className="mb-2">Der Termin ist voll. Ohne Überbuchen kommt die Person auf die Warteliste.</Alert>
						<Form.Check type="checkbox" id="overbook" label="Überbuchen (trotzdem fix anmelden)" {...register("overbook")} />
					</>}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={onClose}>
						Abbrechen
					</Button>
					<Button variant="outline-primary" type='submit' disabled={isSubmitting || (mode === 'existing' && !selected)}>
						Anmelden
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default TrialDayParticipantNew;
