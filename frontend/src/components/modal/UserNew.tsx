import { useForm } from 'react-hook-form';
import { Button, Form, Modal } from 'react-bootstrap';
import { AuthService } from '../../services/auth.service';
import { toast } from 'react-toastify';
import { useMemo } from 'react';

interface Props {
	show: boolean
	onClose: () => void
}

export interface UserNewFormInput {
	email: string
	name: string
	password: string
	passwordConfirmation?: string
}

const UserNew = (props: Props) => {
	const { show, onClose } = props

	const { signUpUser } = useMemo(() => new AuthService(), [])

	const {
		register,
		watch,
		handleSubmit,
		formState: { errors }
	} = useForm<UserNewFormInput>()

	const onFormSubmit = handleSubmit((data) => {
		signUpUser(data)
		.then(() => {
			toast("User erfolgreich angelegt.")
			onClose()
		}, (err) => {
			toast(err.response.data.message)
		})
	})

	return (
		<Modal show={show} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Neuer User</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit}>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="name">
							Name
						</Form.Label>
						<Form.Control
							type="text"
							{...register("name", { required: "Bitte Name eingeben" })}
							id="name"
							isInvalid={!!errors.name}
						/>
						{errors.name && (
							<Form.Text className="text-danger">
								{errors.name.message}
							</Form.Text>
						)}
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="email">
							Email-Adresse
						</Form.Label>
						<Form.Control
							type="email"
							{...register("email", { required: "Bitte Email eingeben" })}
							id="email"
							isInvalid={!!errors.email}
						/>
						{errors.email && (
							<Form.Text className="text-danger">
								{errors.email.message}
							</Form.Text>
						)}
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="password">Passwort</Form.Label>
						<Form.Control
							type="password"
							{...register("password", { required: "Bitte Passwort eingeben", minLength: 4 })}
							id="password"
							isInvalid={!!errors.password}
						/>
						{errors.password && (
							<Form.Text className="text-danger">
								{errors.password.type === 'required' && errors.password.message}
								{errors.password.type === 'minLength' && "Das Passwort sollte mind. aus 4 Zeichen bestehen"}
							</Form.Text>
						)}
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label htmlFor="password-confirmation">Passwort bestätigen</Form.Label>
						<Form.Control
							type="password"
							{...register("passwordConfirmation", { required: "Bitte Passwort-Bestätigung eingeben", minLength: 4, validate: (value) => { return value === watch('password') } })}
							id="password-confirmation"
							isInvalid={!!errors.passwordConfirmation}
						/>
						{errors.passwordConfirmation && (
							<Form.Text className="text-danger">
								{errors.passwordConfirmation.type === 'required' && errors.passwordConfirmation.message}
								{errors.passwordConfirmation.type === 'minLength' && "Das Passwort sollte mind. aus 4 Zeichen bestehen"}
								{errors.passwordConfirmation.type === 'validate' && "Passwörter stimmen nicht überein."}
							</Form.Text>
						)}
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={onClose}>
						Abbrechen
					</Button>
					<Button variant="outline-primary" onClick={onFormSubmit}>
						Speichern
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default UserNew;
