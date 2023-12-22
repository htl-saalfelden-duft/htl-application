import { Form } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { Applicant } from "../../models/applicant.model"
import { useContact } from "../../contexts/contact.context"
import { Application } from "../../models/application.model"
import { useApplication } from "../../contexts/application.context"

export const FormSelect = (props: {
    attr: keyof Application,
    title: string,
    loadOptions(inputValue: string): Promise<any>;
    required?: boolean,
    className?: string
}) => {
    const { attr, title, required, className, loadOptions } = props
    const { index } = useApplication()
    const {
        control,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (

        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`applications.${index}.${attr}`}>
                {title}
            </Form.Label>
            <Controller
                control={control}
                name={`applications.${index}.${attr}`}
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
                        inputId={`applications.${index}.${attr}`}
                    />
                )}
            />
            {errors.applications &&
                errors.applications[index] &&
                errors.applications[index]![attr] && (
                    <Form.Text className="text-danger">
                        {errors.applications![index]![attr]?.message}
                    </Form.Text>
                )}
        </Form.Group>
    )
}