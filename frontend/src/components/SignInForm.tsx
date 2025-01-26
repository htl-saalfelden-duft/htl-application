import { Button, Card, CardBody, Container, Form, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import htlLogo128 from '../assets/images/htl-logo.png'
import { useNavigate } from "react-router-dom"

export interface ISignInFormInput {
	email: string
	password: string
}

interface Props {
    onSubmit: (data: ISignInFormInput) => void
	isUser?: boolean
}

const SignInForm = (props: Props) => {
	const {onSubmit , isUser = false} = props
	const navigate = useNavigate()

    const { 
		register, 
		handleSubmit,
		formState: { errors }
	} = useForm<ISignInFormInput>()

	const onFormSubmit = handleSubmit((data) => {
        onSubmit(data)
	})

	return (
		<Container>
			<Row className='justify-content-md-center'>
				<Card className='col-lg-5 mt-5'>
					<CardBody>
						<div className="d-flex flex-row-reverse">
							<button className="btn btn-link" onClick={() => navigate(isUser ? "/signin-applicant": "/signin-user")}><img src={htlLogo128} width={64} alt="htl-logo" /></button>
							<h5 className="card-title mt-4 flex-grow-1">HTL-Bewerber-Portal - {isUser ? 'Admin' : 'Login'}</h5>
                        </div>
						<Form onSubmit={onFormSubmit}>
							<Form.Group className="mt-3 mb-3">
								<Form.Label htmlFor="email">
									Email-Addresse
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
							<Form.Group className="mb-4">
								<Form.Label htmlFor="password">Passwort</Form.Label>
								<Form.Control
									type="password"
									{...register("password", { required: "Bitte Passwort eingeben" })}
									id="password"
									isInvalid={!!errors.password}
								/>
								{errors.password && (
									<Form.Text className="text-danger">
									{errors.password.message}
									</Form.Text>
								)}								
							</Form.Group>
							<div className='d-flex justify-content-between'>
								<Button variant="outline-primary" type="submit">Einloggen</Button>
								{!isUser && <Button variant="link" onClick={() => navigate("/signup-applicant")}>Zugang beantragen</Button>}
							</div>									
						</Form>
					</CardBody>
				</Card>
			</Row>
		</Container>
	)
}

export default SignInForm