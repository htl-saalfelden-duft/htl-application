import { useForm } from 'react-hook-form';
import { Button, Form, Modal } from 'react-bootstrap';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ApiService } from '../../services/api.service';
import { SchoolClass } from '../../models/schoolClass.model';

interface Props {
	show: boolean
	schoolClass?: SchoolClass
	defaultYear?: string
	onClose: () => void
	onSaved: () => void
}

interface SchoolClassEditFormInput {
	title: string
	sfkz: string
	year: string
	maxPupils: number
	active: boolean
}

const SchoolClassEdit = (props: Props) => {
	const { show, schoolClass, defaultYear, onClose, onSaved } = props

	const apiService = useMemo(() => new ApiService(), [])

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<SchoolClassEditFormInput>()

	const handleShow = () => {
		if (schoolClass) {
			reset({
				title: schoolClass.title,
				sfkz: schoolClass.sfkz,
				year: schoolClass.year,
				maxPupils: schoolClass.maxPupils,
				active: schoolClass.active
			})
		} else {
			reset({ title: '', sfkz: '', year: defaultYear ?? '', maxPupils: 36, active: true })
		}
	}

	const onFormSubmit = handleSubmit((data) => {
		const value = {
			id: schoolClass?.id,
			...data,
			maxPupils: Number(data.maxPupils)
		} as SchoolClass

		return apiService.save<SchoolClass>(SchoolClass, value)
			.then(() => {
				toast("Fachrichtung gespeichert.", { type: 'success' })
				onSaved()
			}, (err) => {
				toast(err.response.data.message, { type: 'error' })
			})
	})

	return (
		<Modal show={show} onShow={handleShow} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>{schoolClass ? "Fachrichtung ändern" : "Neue Fachrichtung"}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit} autoComplete='off'>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="title">Bezeichnung</Form.Label>
						<Form.Control {...register("title", { required: "Bitte Bezeichnung eingeben", validate: value => !!value.trim() || "Bitte Bezeichnung eingeben" })} id="title" isInvalid={!!errors.title} placeholder="z.B. Höhere Abteilung für Bautechnik - Saalfelden" />
						{errors.title && <Form.Text className="text-danger">{errors.title.message}</Form.Text>}
					</Form.Group>
					<div className="row">
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="year">Schuljahr</Form.Label>
							<Form.Control {...register("year", { required: "Bitte Schuljahr eingeben", pattern: { value: /^\d{2}\/\d{2}$/, message: "Format: 25/26" } })} id="year" isInvalid={!!errors.year} placeholder="25/26" />
							{errors.year && <Form.Text className="text-danger">{errors.year.message}</Form.Text>}
						</Form.Group>
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="sfkz">Schulformkennzahl</Form.Label>
							<Form.Control {...register("sfkz", { required: "Bitte SFKZ eingeben" })} id="sfkz" isInvalid={!!errors.sfkz} />
							{errors.sfkz && <Form.Text className="text-danger">{errors.sfkz.message}</Form.Text>}
						</Form.Group>
						<Form.Group className="mb-3 col-md-4">
							<Form.Label htmlFor="maxPupils">Max. Schüler:innen</Form.Label>
							<Form.Control type="number" min={1} {...register("maxPupils", { required: true, min: 1 })} id="maxPupils" isInvalid={!!errors.maxPupils} />
						</Form.Group>
					</div>
					<Form.Check type="switch" id="active" label="Aktiv – für Bewerbungen und Schnuppertage wählbar" {...register("active")} />
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

export default SchoolClassEdit;
