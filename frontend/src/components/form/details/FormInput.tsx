import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../../../models/applicant.model'
import { ApplicantDetails } from '../../../models/applicant-details.model'
import { ErrorMessege } from './ErrorMessage'
import { hasError } from './details-form.util'

interface Props {
    attr: keyof ApplicantDetails
    title: string
    required?: boolean
    className?: string
    type?: 'text' | 'email'
}

export const FormInput = (props: Props) => {
    const { attr, title, required, className } = props
    let { type } = props
    type ||= 'text'

    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`details.${attr}`}>
            {title}{required ? '*' : null}
            </Form.Label>
            <Form.Control
                type={type}
                {...register(`details.${attr}`, { 
                    required: (required ? `Bitte ${title} angeben` : undefined),
                    pattern: type === 'email' ? {
                        value: /\S+@\S+\.\S+/,
                        message: "Bitte gültige Email-Adresse eingeben",
                    } : undefined
                })}
                id={`details.${attr}`}
                isInvalid={hasError(errors, attr)}
            />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}