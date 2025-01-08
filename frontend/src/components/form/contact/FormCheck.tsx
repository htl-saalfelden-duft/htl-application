import { Form } from "react-bootstrap"
import { Contact as IContact } from '../../../models/contact.model'
import { useFormContext } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model"
import { useContact } from "../../../contexts/contact.context"


export const FormCheck = (props: { attr: keyof IContact, title: string, className?: string }) => {
    const { attr, title, className } = props
    const { index } = useContact()
    const { register } = useFormContext<Applicant>()

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Check
                type="checkbox"
                id={`contacts.${index}.${attr}`}
                label={title}
                {...register(`contacts.${index}.${attr}`)}
            />
        </Form.Group>
    )
}