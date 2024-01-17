import { Form } from "react-bootstrap"
import ReactDatePicker from "react-datepicker"
import { Controller, useFormContext } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model"
import { Contact as IContact } from '../../../models/contact.model'
import { useContact } from "../../../contexts/contact.context"
import { ErrorMessege } from "./ErrorMessage"

export const FormDateInput = (props: {
    attr: keyof IContact,
    title: string,
    required?: boolean,
    className?: string
}) => {

    const { attr, title, required, className } = props
    const { index } = useContact()
    const {
        control,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`contacts.${index}.${attr}`}>
                {title}{required ? '*' : null}
            </Form.Label>
            <Controller
                control={control}
                name={`contacts.${index}.${attr}`}
                rules={{
                    required: (required ? `Bitte ${title} angeben` : undefined)
                }}
                render={({ field }) => (
                    <ReactDatePicker
                        wrapperClassName="input-group"
                        className="form-control"
                        placeholderText='Select date'
                        onChange={(value) => field.onChange(value)}
                        id="birthdate"
                        dateFormat="dd.MM.yyy"
                        selected={field.value ? new Date(field.value as string) : undefined}
                    />
                )} />
            <ErrorMessege errors={errors} index={index} attr={attr}/>
        </Form.Group>
    )
}