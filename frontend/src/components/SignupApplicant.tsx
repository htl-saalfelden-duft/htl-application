import { useForm } from 'react-hook-form';

import "./SignupApplicant.scss"
import { Button, Card, CardBody, Container, Form, Row } from 'react-bootstrap';
import { AuthService } from '../services/auth.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export interface SignUpFormInput {
	contactEmail: string
	password: string
	passwordConfirmation: string
}

const SignupApplicant = () => {
	const navigate = useNavigate()
	const authService = useMemo(() => new AuthService(), [])

	const { 
		register,
		watch,
		handleSubmit,
		formState: { errors }
	} = useForm<SignUpFormInput>()

	const onSubmit = handleSubmit((data) => {
		authService.signUp(data)
		.then(() => {
			toast("Sie haben sich erfolgreich angemeldet. Bitte überprüfen Sie ihren Email-Eingang und bestätigen Sie sie Anmeldung.")
			navigate("/signin")
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
							<h5 className="card-title">Zugang beantragen</h5>
							<Form.Group className="mb-3">
								<Form.Label htmlFor="email">
									Email
								</Form.Label>
								<Form.Control
									type="email"
									{...register("contactEmail", { required: "Bitte Email eingeben" })}
									id="email"
								/>
								{errors.contactEmail && (
									<Form.Text className="text-danger">
										{errors.contactEmail.message}
									</Form.Text>
								)}
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label htmlFor="password">Passwort</Form.Label>
								<Form.Control
									type="password"
									{...register("password", { required: "Bitte Passwort eingeben", minLength: 4 })}
									id="password" />
								{errors.password && (
									<Form.Text className="text-danger">
										{errors.password.type  === 'required' && errors.password.message}
										{errors.password.type  === 'minLength' && "Das Passwort sollte mind. aus 4 Zeichen bestehen"}
									</Form.Text>
								)}								
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label htmlFor="password-confirmation">Passwort bestätigen</Form.Label>
								<Form.Control 
									type="password"
									{...register("passwordConfirmation", { required: "Bitte Passwort-Bestätigung eingeben", minLength: 4, validate: (value) => { return value === watch('password') }  })}
									id="password-confirmation" />
								{errors.passwordConfirmation && (
									<Form.Text className="text-danger">
										{errors.passwordConfirmation.type  === 'required' && errors.passwordConfirmation.message}
										{errors.passwordConfirmation.type  === 'minLength' && "Das Passwort sollte mind. aus 4 Zeichen bestehen"}
										{errors.passwordConfirmation.type  === 'validate' && "Passwörter stimmen nicht überein."}
									</Form.Text>
								)}								
							</Form.Group>										
							<Button variant="primary" type="submit">Absenden</Button>
						</Form>
					</CardBody>
				</Card>
			</Row>
		</Container>
	)
}

export default SignupApplicant;
