import { Form } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { Applicant } from "../../../models/applicant.model"
import { ErrorMessege } from "./ErrorMessage"
import { SchoolReport } from "../../../models/schoolReport.model"

export const FormGroup= (props: {
    attr: keyof SchoolReport,
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
            <Form.Label htmlFor={`schoolReport.${attr}`}>
                Gruppe<br/> {title}{required ? '*' : null}
            </Form.Label>
            <Controller
                control={control}
                name={`schoolReport.${attr}`}
                rules={{
                    required: (required ? `Bitte Gruppe angeben` : undefined)
                }}
                render={({ field }) => (
                    <AsyncSelect
                        ref={field.ref}
                        loadOptions={loadOptions}
                        defaultOptions
                        value={{ title: field.value }}
                        onChange={val => field.onChange(val?.title)}
                        getOptionLabel={option => option.title as string}
                        inputId={`schoolReport.${attr}`}
                    />
                )}
            />
            <ErrorMessege errors={errors} attr={attr}/>
        </Form.Group>
    )
}