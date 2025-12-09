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
    placeholder?: string
    type?: 'text' | 'email' | 'svn'
}

export const FormInput = (props: Props) => {
    const { attr, title, required, className, placeholder } = props
    let { type } = props
    type ||= 'text'

    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    const getPattern = (type: string) => {
        switch (type) {
            case 'email':
                return {
                    value: /\S+@\S+\.\S+/,
                    message: "Bitte gültige Email-Adresse eingeben",
                }
            case 'svn':
                return {
                    value: /\d{10}/,
                    message: "Bitte gültige Sozialversicherungsnummer eingeben",
                }    
            default:
                return undefined
        }
    }

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`details.${attr}`}>
            {title}{required ? '*' : null}
            </Form.Label>
            <Form.Control
                type={type == 'svn' ? 'text' : type}
                {...register(`details.${attr}`, { 
                    required: (required ? `Bitte ${title} angeben` : undefined),
                    pattern: getPattern(type)
                })}
                id={`details.${attr}`}
                isInvalid={hasError(errors, attr)}
                placeholder={placeholder}
            />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}