import { useForm } from 'react-hook-form';
import { Button, Form, Modal } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import moment from 'moment';
import { ApiService } from '../../services/api.service';
import { SchoolClass } from '../../models/schoolClass.model';
import { TrialDay } from '../../models/trialDay.model';

interface Props {
	show: boolean
	trialDay?: TrialDay
	onClose: () => void
	onSaved: () => void
}

interface TrialDayEditFormInput {
	schoolClassID: string
	date: string
	timeFrom: string
	timeTo: string
	maxParticipants: number
	registrationDeadline: string
	description: string
	active: boolean
}

const TrialDayEdit = (props: Props) => {
	const { show, trialDay, onClose, onSaved } = props

	const apiService = useMemo(() => new ApiService(), [])
	const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([])

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<TrialDayEditFormInput>()

	const handleShow = () => {
		// Only active classes can be chosen (SPEC 4.5)
		apiService.get<SchoolClass[]>(SchoolClass).then(setSchoolClasses)

		if (trialDay) {
			reset({
				schoolClassID: trialDay.schoolClassID,
				date: moment(trialDay.startAt).format('YYYY-MM-DD'),
				timeFrom: moment(trialDay.startAt).format('HH:mm'),
				timeTo: moment(trialDay.endAt).format('HH:mm'),
				maxParticipants: trialDay.maxParticipants,
				registrationDeadline: moment(trialDay.registrationDeadline).format('YYYY-MM-DDTHH:mm'),
				description: trialDay.description ?? '',
				active: trialDay.active
			})
		} else {
			reset({ schoolClassID: '', date: '', timeFrom: '08:00', timeTo: '12:30', maxParticipants: 10, registrationDeadline: '', description: '', active: false })
		}
	}

	const onFormSubmit = handleSubmit((data) => {
		const value: TrialDay = {
			id: trialDay?.id,
			schoolClassID: data.schoolClassID,
			startAt: moment(`${data.date}T${data.timeFrom}`).toDate(),
			endAt: moment(`${data.date}T${data.timeTo}`).toDate(),
			maxParticipants: Number(data.maxParticipants),
			registrationDeadline: moment(data.registrationDeadline).toDate(),
			description: data.description,
			active: data.active
		}

		return apiService.save<TrialDay>(TrialDay, value)
			.then(() => {
				toast("Termin gespeichert.", { type: 'success' })
				onSaved()
			}, (err) => {
				toast(err.response.data.message, { type: 'error' })
			})
	})

	return (
		<Modal show={show} onShow={handleShow} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>{trialDay ? "Schnuppertermin ändern" : "Neuer Schnuppertermin"}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit} autoComplete='off'>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="schoolClassID">Fachrichtung</Form.Label>
						<Form.Select {...register("schoolClassID", { required: "Bitte Fachrichtung wählen" })} id="schoolClassID" isInvalid={!!errors.schoolClassID}>
							<option value="">Bitte wählen</option>
							{schoolClasses.map(sc => <option key={sc.id} value={sc.id}>{sc.title} ({sc.year})</option>)}
						</Form.Select>
						{errors.schoolClassID && <Form.Text className="text-danger">{errors.schoolClassID.message}</Form.Text>}
					</Form.Group>
					<div className="row">
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="date">Datum</Form.Label>
							<Form.Control type="date" {...register("date", { required: "Bitte Datum eingeben" })} id="date" isInvalid={!!errors.date} />
							{errors.date && <Form.Text className="text-danger">{errors.date.message}</Form.Text>}
						</Form.Group>
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="timeFrom">Uhrzeit von</Form.Label>
							<Form.Control type="time" {...register("timeFrom", { required: true })} id="timeFrom" isInvalid={!!errors.timeFrom} />
						</Form.Group>
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="timeTo">Uhrzeit bis</Form.Label>
							<Form.Control type="time" {...register("timeTo", { required: true, validate: (value, values) => value > values.timeFrom || "Ende muss nach dem Beginn liegen" })} id="timeTo" isInvalid={!!errors.timeTo} />
							{errors.timeTo && <Form.Text className="text-danger">{errors.timeTo.message}</Form.Text>}
						</Form.Group>
					</div>
					<div className="row">
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="maxParticipants">Max. Teilnehmer:innen</Form.Label>
							<Form.Control type="number" min={1} {...register("maxParticipants", { required: true, min: 1 })} id="maxParticipants" isInvalid={!!errors.maxParticipants} />
						</Form.Group>
						<Form.Group className="mb-3 col-md-8">
							<Form.Label htmlFor="registrationDeadline">Anmelde- und Stornoschluss</Form.Label>
							<Form.Control
								type="datetime-local"
								{...register("registrationDeadline", {
									required: "Bitte Anmeldeschluss eingeben",
									validate: (value, values) => !values.date || value <= `${values.date}T${values.timeFrom}` || "Der Anmeldeschluss muss vor dem Termin liegen"
								})}
								id="registrationDeadline"
								isInvalid={!!errors.registrationDeadline} />
							{errors.registrationDeadline && <Form.Text className="text-danger">{errors.registrationDeadline.message}</Form.Text>}
						</Form.Group>
					</div>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="description">Beschreibung / Hinweise</Form.Label>
						<Form.Control as="textarea" rows={3} {...register("description")} id="description" placeholder="z.B. Ablauf, Treffpunkt, Mitzubringen (erscheint auch in der Bestätigungsmail)" />
					</Form.Group>
					<Form.Check type="switch" id="active" label="Für Bewerber:innen sichtbar und buchbar" {...register("active")} />
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={onClose}>
						Abbrechen
					</Button>
					<Button variant="outline-primary" type='submit' disabled={isSubmitting}>
						Speichern
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default TrialDayEdit;
