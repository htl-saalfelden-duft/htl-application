import { Button, Form, Modal } from "react-bootstrap"
import { Controller, useForm } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { ContactType } from "../../models/contact.model"
import { useMemo } from "react"
import { ApiService } from "../../services/api.service"

interface Props {
    show: boolean
    exclude?: ContactType[]
    onClose: () => void
    onSubmit: (contactType: IContactNewFormInput) => void
}

export interface IContactNewFormInput {
    contactType: ContactType
}

const ContactNew = (props: Props) => {
    const apiService = useMemo(() => new ApiService(), [])

    const { show, onSubmit, onClose } = props

    const {
        handleSubmit,
        control,
    } = useForm<IContactNewFormInput>()

    const onFormSubmit = handleSubmit((data) => {
        onSubmit(data)
    })

    const getContactTypes = (inputValue: string) => {
		return apiService.get<ContactType[]>(ContactType, undefined, { title: inputValue })
	}

    return (
        <Modal show={show} onHide={onClose} size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Kontakt hinzufügen</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onFormSubmit} >
                <Modal.Body>
                    <Form.Group>
                        <Form.Label htmlFor="contactType">
                            Kontakt-Typ
                        </Form.Label>
                        <Controller
                            control={control}
                            name="contactType"
                            rules={{
                                required: "Bitte Kontakt-Typ auswählen"
                            }}
                            render={({ field }) => (
                                <AsyncSelect
                                    ref={field.ref}
                                    loadOptions={getContactTypes}
                                    defaultOptions
                                    onChange={val => field.onChange(val)}
                                    getOptionLabel={option => option.title}
                                    getOptionValue={option => option.title}
                                    inputId="contactType"
                                />
                            )}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={onFormSubmit}>
                        Hinzufügen
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default ContactNew