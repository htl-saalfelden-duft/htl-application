import { Form } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { Applicant } from "../../../models/applicant.model"
import { ErrorMessege } from "./ErrorMessage"
import { ApplicantDetails } from "../../../models/applicant-details.model"

export const FormSelect = (props: {
    attr: keyof ApplicantDetails,
    title: string,
    loadOptions(inputValue: string): Promise<any>;
    required?: boolean,
    className?: string
}) => {
    const { attr, title, required, className, loadOptions } = props
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
                    <AsyncSelect
                        ref={field.ref}
                        loadOptions={loadOptions}
                        defaultOptions
                        value={{ title: field.value }}
                        onChange={val => field.onChange(val?.title)}
                        getOptionLabel={option => option.title as string}
                        inputId={`details.${attr}`}
                    />
                )}
            />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}