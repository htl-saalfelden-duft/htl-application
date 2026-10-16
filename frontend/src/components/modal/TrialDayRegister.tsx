import { useForm } from 'react-hook-form';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiService } from '../../services/api.service';
import { Applicant } from '../../models/applicant.model';
import { formatDateTime, formatTrialDayDate, formatTrialDayTime, TrialDay, TrialDayRegistration } from '../../models/trialDay.model';
import Dsgvo from './Dsgvo';

interface Props {
	trialDay?: TrialDay
	applicant?: Applicant
	onClose: () => void
	onRegistered: () => void
}

interface TrialDayRegisterFormInput {
	firstname: string
	lastname: string
	school: string
	currentClass: string
	guardianPhone: string
	annotation: string
	dsgvo: boolean
}

const TrialDayRegister = (props: Props) => {
	const { trialDay, applicant, onClose, onRegistered } = props

	const apiService = useMemo(() => new ApiService(), [])
	const [showDsgvo, setShowDsgvo] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<TrialDayRegisterFormInput>()

	const full = !!trialDay && (trialDay.registeredCount ?? 0) >= trialDay.maxParticipants

	const handleShow = () => {
		reset({
			firstname: applicant?.details?.firstname ?? '',
			lastname: applicant?.details?.lastname ?? '',
			school: applicant?.details?.previousSchoolTxt ?? '',
			currentClass: '',
			guardianPhone: '',
			annotation: '',
			dsgvo: false
		})
	}

	const onFormSubmit = handleSubmit((data) => {
		return apiService.post<TrialDayRegistration>(TrialDayRegistration, '', { ...data, trialDayID: trialDay!.id })
			.then((registration) => {
				if (registration.statusKey === 'waiting') {
					toast("Der Termin ist ausgebucht. Sie stehen auf der Warteliste und erhalten eine E-Mail, sobald ein Platz frei wird.", { type: 'info', autoClose: 1E4 })
				} else {
					toast("Sie sind zum Schnuppertag angemeldet. Sie erhalten eine Bestätigung per E-Mail.", { type: 'success', autoClose: 1E4 })
				}
				onRegistered()
			}, (err) => {
				toast(err.response.data.message, { type: 'error' })
			})
	})

	return (
		<Modal show={!!trialDay} onShow={handleShow} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Anmeldung zum Schnuppertag</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit} autoComplete='off'>
				<Modal.Body>
					{trialDay && <>
						<p>
							<strong>{trialDay.schoolClass?.title}</strong><br />
							{formatTrialDayDate(trialDay)}, {formatTrialDayTime(trialDay)}
						</p>
						{full && <Alert variant="warning">Dieser Termin ist bereits ausgebucht. Ihre Anmeldung kommt auf die Warteliste.</Alert>}
					</>}
					<div className="row">
						<Form.Group className="mb-3 col-md-6">
							<Form.Label htmlFor="firstname">Vorname des Kindes *</Form.Label>
							<Form.Control {...register("firstname", { required: "Bitte Vorname eingeben" })} id="firstname" isInvalid={!!errors.firstname} />
							{errors.firstname && <Form.Text className="text-danger">{errors.firstname.message}</Form.Text>}
						</Form.Group>
						<Form.Group className="mb-3 col-md-6">
							<Form.Label htmlFor="lastname">Nachname des Kindes *</Form.Label>
							<Form.Control {...register("lastname", { required: "Bitte Nachname eingeben" })} id="lastname" isInvalid={!!errors.lastname} />
							{errors.lastname && <Form.Text className="text-danger">{errors.lastname.message}</Form.Text>}
						</Form.Group>
					</div>
					<div className="row">
						<Form.Group className="mb-3 col-md-8">
							<Form.Label htmlFor="school">Aktuelle Schule *</Form.Label>
							<Form.Control {...register("school", { required: "Bitte Schule eingeben" })} id="school" placeholder="z.B. MS Saalfelden" isInvalid={!!errors.school} />
							{errors.school && <Form.Text className="text-danger">{errors.school.message}</Form.Text>}
						</Form.Group>
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="currentClass">Klasse</Form.Label>
							<Form.Control {...register("currentClass")} id="currentClass" placeholder="z.B. 4b" />
						</Form.Group>
					</div>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="guardianPhone">Telefonnummer eines Erziehungsberechtigten *</Form.Label>
						<Form.Control type="tel" {...register("guardianPhone", { required: "Bitte Telefonnummer eingeben" })} id="guardianPhone" isInvalid={!!errors.guardianPhone} />
						{errors.guardianPhone && <Form.Text className="text-danger">{errors.guardianPhone.message}</Form.Text>}
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="annotation">Bemerkung</Form.Label>
						<Form.Control as="textarea" rows={2} {...register("annotation")} id="annotation" placeholder="Wichtige Hinweise für den Schnuppertag" />
					</Form.Group>
					{!applicant?.dsgvo &&
						<Form.Group className="mb-3">
							<Form.Check
								type="checkbox"
								id="dsgvo"
								label={(<>Ich stimme der<Button className="btn-dsgvo" variant="link" onClick={() => setShowDsgvo(true)}>Datenschutzgrundverordnung</Button>der HTL Saalfelden zu. *</>)}
								{...register("dsgvo", { required: "Bitte akzeptieren Sie die Datenschutzbestimmungen" })} />
							{errors.dsgvo && <Form.Text className="text-danger">{errors.dsgvo.message}</Form.Text>}
						</Form.Group>
					}
					{trialDay && <Form.Text muted>Sie können die Anmeldung bis {formatDateTime(trialDay.registrationDeadline)} selbst stornieren oder umbuchen.</Form.Text>}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={onClose}>
						Abbrechen
					</Button>
					<Button variant="outline-primary" type='submit' disabled={isSubmitting}>
						{full ? 'Auf Warteliste setzen' : 'Anmelden'}
					</Button>
				</Modal.Footer>
			</Form>
			<Dsgvo show={showDsgvo} onClose={() => setShowDsgvo(false)} />
		</Modal>
	)
}

export default TrialDayRegister;
