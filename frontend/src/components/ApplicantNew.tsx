import { Button, Form, Modal } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { ErrorMessege } from "./form/details/ErrorMessage"

interface Props {
    show: boolean
    onClose: () => void
    onSubmit: (applicant: IApplicantNewFormInput) => void
}

export interface IApplicantNewFormInput {
    email: string
    password: string
    details: { firstname: string, lastname: string }
}

const ApplicantNew = (props: Props) => {

    const { show, onSubmit, onClose } = props

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<IApplicantNewFormInput>()

    const onFormSubmit = handleSubmit((data) => {
        onSubmit(data)
    })

    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Neuer Bewerber</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onFormSubmit} >
                <Modal.Body>
                    <Form.Group className={`mb-3 col-lg-6`}>
                        <Form.Label htmlFor={`details.firstname`}>
                            Vorname*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register(`details.firstname`, { required: "Bitte Vorname angeben" })}
                            id={`details.firstname`}
                            isInvalid={!!(errors.details && errors.details.firstname)}
                        />
                        <ErrorMessege errors={errors} attr={'firstname'} />
                    </Form.Group>

                    <Form.Group className={`mb-3 col-lg-6`}>
                        <Form.Label htmlFor={`details.lastname`}>
                            Nachname*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register(`details.lastname`, { required: "Bitte Nachname angeben" })}
                            id={`details.lastname`}
                            isInvalid={!!(errors.details && errors.details.lastname)}
                        />
                        <ErrorMessege errors={errors} attr={'lastname'} />
                    </Form.Group>
                    <Form.Group className="mb-3 col-lg-6">
                        <Form.Label htmlFor="email">
                            Email address
                        </Form.Label>
                        <Form.Control
                            type="email"
                            {...register("email", { required: "Bitte Email eingeben", maxLength: 20 })}
                            id="email"
                            isInvalid={!!errors.email}
                        />
                        {errors.email && (
                            <Form.Text className="text-danger">
                                {errors.email.message}
                            </Form.Text>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3 col-lg-6">
                        <Form.Label htmlFor="password">Password</Form.Label>
                        <Form.Control
                            type="password"
                            autoComplete="new-password"
                            {...register("password", { required: "Bitte Passwort eingeben", maxLength: 20 })}
                            id="password"
                            isInvalid={!!errors.password}
                        />
                        {errors.password && (
                            <Form.Text className="text-danger">
                                {errors.password.message}
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

export default ApplicantNew