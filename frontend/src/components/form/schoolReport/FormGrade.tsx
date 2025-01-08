import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../../../models/applicant.model'
import { ErrorMessege } from './ErrorMessage'
import { SchoolReport } from '../../../models/schoolReport.model'

interface Props { 
    attr: keyof SchoolReport
    title: string
    required?: boolean
    className?: string
}

export const FormGrade = (props: Props) => {
    const { attr, title, required, className } = props
    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    const hasError = !!(errors.schoolReport && errors.schoolReport[attr])

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`schoolReport.${attr}`}>
                {title}{required ? '*' : null}
            </Form.Label>
            <Form.Control
                type="number"
                {...register(`schoolReport.${attr}`, {valueAsNumber: true, required: "Bitte Note eingeben"})}
                id={`schoolReport.${attr}`}
                min={1}
                max={5}
                isInvalid={hasError}
            />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}