import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../../../models/applicant.model'
import { ApplicantDetails } from '../../../models/applicant-details.model'
import { ErrorMessege } from './ErrorMessage'

interface Props {
    attr: keyof ApplicantDetails
    title: string
    required?: boolean
    className?: string
    type?: string
}

export const FormInput = (props: Props) => {
    const { attr, title, required, className } = props
    let { type } = props
    type ||= 'text'

    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    const hasError = !!(errors.details && errors.details[attr])

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor="firstname">
            {title}{required ? '*' : null}
            </Form.Label>
            <Form.Control
                type={type}
                {...register(`details.${attr}`, { required: (required ? `Bitte ${title} angeben` : undefined) })}
                id="firstname"
                isInvalid={hasError}
            />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}