import { Form } from 'react-bootstrap'
import { Contact as IContact } from '../../../models/contact.model'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../../../models/applicant.model'
import { useContact } from '../../../contexts/contact.context'


export const FormInput = (props: { attr: keyof IContact, title: string, required?: boolean, className?: string, type?: string }) => {
    const { attr, title, required, className } = props
    let { type } = props
    type ||= 'text'

    const { index } = useContact()

    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`contacts.${index}.${attr}`}>
                {title}
            </Form.Label>
            <Form.Control
                type={type}
                {...register(`contacts.${index}.${attr}`, { required: (required ? `Bitte ${title} angeben` : undefined) })}
                id={`contacts.${index}.${attr}`}
            />
            {errors.contacts &&
                errors.contacts[index] &&
                errors.contacts[index]![attr] && (
                    <Form.Text className="text-danger">
                        {errors.contacts![index]![attr]?.message}
                    </Form.Text>
                )}
        </Form.Group>
    )
}