import { Button, Card, CardBody, Container, Form, Row } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth.context"
import { toast } from "react-toastify"

interface IFormInput {
	contactEmail: string
	password: string
}

const SignIn = () => {
	const navigate = useNavigate()
	const { signIn } = useAuth()

    const { 
		register, 
		handleSubmit,
		formState: { errors }
	} = useForm<IFormInput>()

	const onSubmit = handleSubmit((data) => {
        signIn(data.contactEmail,data.password)
        .then(() => {
			toast("Welcome to HTL-Applications-portal!")
			navigate("/home")
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
							<h5 className="card-title">Einloggen</h5>
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
							<Button variant="primary" type="submit">Sign In</Button>
						</Form>
					</CardBody>
				</Card>
			</Row>
		</Container>
	)
}

export default SignIn