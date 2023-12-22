import { Form } from "react-bootstrap"
import ReactDatePicker from "react-datepicker"
import { Controller, useFormContext } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model"
import { Contact as IContact } from '../../../models/contact.model'
import { useContact } from "../../../contexts/contact.context"

export const FormatDateInput = (props: {
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
                {title}
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
                        onChange={(value) => {
                            console.log(value)
                            return field.onChange(value)
                        }}
                        id="birthdate"
                        dateFormat="dd.MM.yyy"
                        selected={field.value ? new Date(field.value as string) : undefined}
                    />
                )} />
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