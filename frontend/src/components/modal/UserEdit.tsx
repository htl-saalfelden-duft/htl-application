import { useForm } from 'react-hook-form';
import { Button, Form, Modal } from 'react-bootstrap';
import { AuthService } from '../../services/auth.service';
import { toast } from 'react-toastify';
import { useEffect, useMemo } from 'react';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.model';

interface Props {
	show: boolean
	userID?: string
	onClose: () => void
}

export interface UserEditFormInput {
	id?: string
	email: string
	name: string
	password?: string
	passwordConfirmation?: string
}

const UserEdit = (props: Props) => {
	const { show, onClose } = props

	const { signUpUser } = useMemo(() => new AuthService(), [])
	const apiService = useMemo(() => new ApiService(), [])

	const {
		register,
		watch,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<UserEditFormInput>()

	const onFormSubmit = handleSubmit((data) => {
		if(props.userID) {
			data.id = props.userID

			if(!data.password) {
				delete data.password
				delete data.passwordConfirmation
			}

			apiService.save<User>(User, data as any)
			.then(() => {
				toast("User erfolgreich gespeichert.")
				onClose()
			}, (err) => {
				toast(err.response.data.message)
			})			
		} else {
			signUpUser(data)
			.then(() => {
				toast("User erfolgreich angelegt.")
				onClose()
			}, (err) => {
				toast(err.response.data.message)
			})
		}
	})

	const handleShow = () => {
		if(props.userID) {
			apiService.get<User>(User, props.userID)
			.then(user => {
				reset(user)
			})
		} else {
			reset({name: '', email: '', password: '', passwordConfirmation: ''})
		}
	}

	return (
		<Modal show={show} onShow={handleShow} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>{props.userID ? "User ändern":"Neuer User"}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit} autoComplete='off'>
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
							autoComplete="new-password"
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
							{...register("password", { required: !props.userID ? "Bitte Passwort eingeben" : undefined, minLength: 4 })}
							id="password"
							isInvalid={!!errors.password}
							autoComplete="new-password"
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
							{...register("passwordConfirmation", { required: !props.userID ? "Bitte Passwort-Bestätigung eingeben": undefined, minLength: 4, validate: (value) => { return value === watch('password') } })}
							id="password-confirmation"
							isInvalid={!!errors.passwordConfirmation}
							autoComplete="new-password"
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
					<Button variant="outline-primary" type='submit'>
						Speichern
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default UserEdit;
