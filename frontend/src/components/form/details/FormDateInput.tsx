import { Form } from "react-bootstrap"
import ReactDatePicker from "react-datepicker"
import { Controller, useFormContext } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model"
import { ErrorMessege } from "./ErrorMessage"
import { ApplicantDetails } from "../../../models/applicant-details.model"
import { hasError } from "./details-form.util"

export const FormDateInput = (props: {
    attr: keyof ApplicantDetails,
    title: string,
    required?: boolean,
    className?: string
}) => {

    const { attr, title, required, className } = props

    const {
        control,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`details.${attr}`}>
                {title}{required ? '*' : null}
            </Form.Label>
            <Controller
                control={control}
                name={`details.${attr}`}
                rules={{
                    required: (required ? `Bitte ${title} angeben` : undefined)
                }}
                render={({ field }) => (
                    <ReactDatePicker
                        wrapperClassName="input-group"
                        className={`form-control ${hasError(errors, attr) ? 'is-invalid' : ''}`}
                        placeholderText='Select date'
                        onChange={(value) => field.onChange(value)}
                        id={`details.${attr}`}
                        dateFormat="dd.MM.yyyy"
                        selected={field.value ? new Date(field.value as string) : undefined}
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        showMonthDropdown
                        showYearDropdown
                    />
                )} />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}