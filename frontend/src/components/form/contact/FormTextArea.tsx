import { useFormContext } from 'react-hook-form'
import { useContact } from '../../../contexts/contact.context'
import { Applicant } from '../../../models/applicant.model'
import { Contact } from '../../../models/contact.model'
import { Form } from 'react-bootstrap'
import { ErrorMessege } from './ErrorMessage'

export const FormTextArea = (props: { attr: keyof Contact, title: string, required?: boolean, className?: string, type?: string }) => {
    const { attr, title, required, className } = props
    let { type } = props
    type ||= 'text'

    const { index } = useContact()

    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (
        <Form.Group className={className}>
            <Form.Label htmlFor={`contacts.${index}.${attr}`}>
                {title}{required ? '*' : null}
            </Form.Label>
            <Form.Control 
                as="textarea"
                rows={3}
                {...register(`contacts.${index}.${attr}`, { required: (required ? `Bitte ${title} angeben` : undefined) })}
                id="annotation"
            />
            <ErrorMessege errors={errors} index={index} attr={attr}/>
        </Form.Group>
    )
}