import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ApiService } from '../services/api.service';
import { Applicant } from '../models/applicant.model';
import Dsgvo from './modal/Dsgvo';
import htlLogo128 from '../assets/images/htl-logo.png'

interface SetPasswordFormInput {
	password: string
	passwordConfirmation: string
	dsgvo: boolean
}

// Landing page of the invitation mail for accounts created by the administration
const SetPassword = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const apiService = useMemo(() => new ApiService(), [])
	const [showDsgvo, setShowDsgvo] = useState(false)
	const token = new URLSearchParams(location.search).get('token')

	const {
		register,
		watch,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<SetPasswordFormInput>()

	const onSubmit = handleSubmit((data) => {
		return apiService.post(Applicant, 'set-password', { token, password: data.password, dsgvo: data.dsgvo })
			.then(() => {
				toast("Ihr Passwort wurde festgelegt. Sie können sich jetzt anmelden.", { type: 'success' })
				navigate("/signin-applicant")
			}, (err) => {
				toast(err.response.data.message, { type: 'error' })
			})
	})

	return (
		<Container>
			<Row className='justify-content-md-center'>
				<Card className='col-lg-5 mt-5'>
					<CardBody>
						<Form onSubmit={onSubmit}>
							<div className="d-flex flex-row-reverse">
								<img src={htlLogo128} width={64} alt="htl-logo" />
								<h5 className="card-title mt-4 flex-grow-1">HTL-Bewerber-Portal - Passwort festlegen</h5>
							</div>
							<p className="mt-3">Die HTL Saalfelden hat für Sie ein Konto angelegt. Bitte legen Sie ein Passwort fest.</p>
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
									{...register("passwordConfirmation", { required: "Bitte Passwort-Bestätigung eingeben", validate: (value) => value === watch('password') })}
									id="password-confirmation"
									isInvalid={!!errors.passwordConfirmation}
								/>
								{errors.passwordConfirmation && (
									<Form.Text className="text-danger">
										{errors.passwordConfirmation.type === 'required' && errors.passwordConfirmation.message}
										{errors.passwordConfirmation.type === 'validate' && "Passwörter stimmen nicht überein."}
									</Form.Text>
								)}
							</Form.Group>
							<Form.Group className="mb-4">
								<Form.Check
									type="checkbox"
									id="dsgvo"
									label={(<>Ich stimme der<Button className="btn-dsgvo" variant="link" onClick={() => setShowDsgvo(true)}>Datenschutzgrundverordnung</Button>der HTL Saalfelden zu.</>)}
									{...register("dsgvo", { required: "Bitte akzeptieren Sie die Datenschutzbestimmungen" })} />
								{errors.dsgvo && <Form.Text className="text-danger">{errors.dsgvo.message}</Form.Text>}
							</Form.Group>
							<Button variant="outline-primary" type="submit" disabled={isSubmitting || !token}>Passwort festlegen</Button>
						</Form>
					</CardBody>
				</Card>
			</Row>
			<Dsgvo show={showDsgvo} onClose={() => setShowDsgvo(false)} />
		</Container>
	)
}

export default SetPassword
