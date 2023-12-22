import { useForm } from 'react-hook-form';

import "./SignupApplicant.scss"
import { Button, Card, CardBody, Container, Form, Row } from 'react-bootstrap';
import { AuthService } from '../services/auth.service';

export interface SignUpFormInput {
	contactEmail: string
	password: string
	passwordConfirmation: string
}

const SignupApplicant = () => {
	const authService = new AuthService()

	const { 
		register, 
		handleSubmit,
		formState: { errors }
	} = useForm<SignUpFormInput>()

	const onSubmit = handleSubmit((data) => {
		authService.signUp(data)
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
									Email address
								</Form.Label>
								<Form.Control
									type="email"
									{...register("contactEmail", { required: "Bitte Email eingeben", maxLength: 20 })}
									id="email"
								/>
								{errors.contactEmail && (
									<Form.Text className="text-danger">
									{errors.contactEmail.message}
									</Form.Text>
								)}
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label htmlFor="password">Password</Form.Label>
								<Form.Control
									type="password"
									{...register("password", { required: "Bitte Passwort eingeben", maxLength: 20 })}
									id="password" />
								{errors.password && (
									<Form.Text className="text-danger">
									{errors.password.message}
									</Form.Text>
								)}								
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label htmlFor="password-confirmation">Password bestätigen</Form.Label>
								<Form.Control 
									type="password"
									{...register("passwordConfirmation", { required: "Bitte Passwort-Bestätigung eingeben", maxLength: 20 })}
									id="password-confirmation" />
								{errors.passwordConfirmation && (
									<Form.Text className="text-danger">
									{errors.passwordConfirmation.message}
									</Form.Text>
								)}									
							</Form.Group>										
							<Button variant="primary" type="submit">Submit</Button>
						</Form>
					</CardBody>
				</Card>
			</Row>
		</Container>
	)
}

export default SignupApplicant;
