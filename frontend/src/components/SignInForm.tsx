import { Button, Card, CardBody, Container, Form, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import htlLogo128 from '../assets/images/htl-saalfelden-logo_128.png'

export interface IFormInput {
	contactEmail: string
	password: string
}

interface Props {
    onSubmit: (data: IFormInput) => void
}

const SignInForm = (props: Props) => {

    const { 
		register, 
		handleSubmit,
		formState: { errors }
	} = useForm<IFormInput>()

	const onSubmit = handleSubmit((data) => {
        props.onSubmit(data)
	})

	return (
		<Container>
			<Row className='justify-content-md-center'>
				<Card className='col-lg-5 mt-5'>
					<CardBody>
						<Form onSubmit={onSubmit}>
                            <div className="d-flex flex-row-reverse">
                                <img src={htlLogo128} width={64} alt="htl-logo" />
							    <h5 className="card-title mt-4 flex-grow-1">Bewerbungsseite - Einloggen</h5>
                            </div>

							<Form.Group className="mt-4 mb-3">
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
							<Button variant="outline-primary" type="submit">Sign In</Button>
						</Form>
					</CardBody>
				</Card>
			</Row>
		</Container>
	)
}

export default SignInForm