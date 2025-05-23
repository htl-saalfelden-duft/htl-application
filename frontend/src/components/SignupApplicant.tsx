import { useForm } from 'react-hook-form';

import { Button, Card, CardBody, Container, Form, Row } from 'react-bootstrap';
import { AuthService } from '../services/auth.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import htlLogo128 from '../assets/images/htl-logo.png'


export interface SignUpApplicantFormInput {
	email: string
	password: string
	passwordConfirmation?: string
	statusKey?: string
}

const SignupApplicant = () => {
	const navigate = useNavigate()
	const { signUpApplicant } = useMemo(() => new AuthService(), [])

	const {
		register,
		watch,
		handleSubmit,
		formState: { errors }
	} = useForm<SignUpApplicantFormInput>()

	const onSubmit = handleSubmit((data) => {		
		signUpApplicant(data)
			.then(() => {
				toast("Sie haben sich erfolgreich angemeldet. Sie erhalten ihren Zugangslink per E-Mail.")
				navigate("/signin-applicant")
			}, (err) => {
				toast(err.response.data.message)
			})
	})

	return (
		<Container>
			<Row className='justify-content-md-center'>
				<Card className='col-lg-5 mt-5'>
					<CardBody>
						<Form onSubmit={onSubmit}>
							<div className="d-flex flex-row-reverse">
								<button className="btn btn-link" onClick={() => navigate('/signin-applicant')}><img src={htlLogo128} width={64} alt="htl-logo" /></button>
								<h5 className="card-title mt-4 flex-grow-1">HTL-Bewerber-Portal - Registrieren</h5>
							</div>
							<Form.Group className="mt-3 mb-3">
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
							<Form.Group className="mb-4">
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
							<div className='d-flex justify-content-between'>
								<Button variant="outline-primary" type="submit">Zugang beantragen</Button>
								<Button variant="link" onClick={() => navigate("/signin-applicant")}>Einloggen</Button>
							</div>
						</Form>
					</CardBody>
				</Card>
			</Row>
		</Container>
	)
}

export default SignupApplicant;
