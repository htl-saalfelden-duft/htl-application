import { Form } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { Applicant } from "../../../models/applicant.model"
import { Contact as IContact } from '../../../models/contact.model'
import { useContact } from "../../../contexts/contact.context"
import { ErrorMessege } from "./ErrorMessage"
import { hasError } from "./contact-form.util"

export const FormSelect = (props: {
    attr: keyof IContact,
    title: string,
    loadOptions(inputValue: string): Promise<any>;
    required?: boolean,
    className?: string
}) => {
    const { attr, title, required, className, loadOptions } = props
    const { index } = useContact()
    const {
        control,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (

        <Form.Group className={`form-select-group  mb-3 ${className}`}>
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
                    <AsyncSelect
                        ref={field.ref}
                        loadOptions={loadOptions}
                        defaultOptions
                        value={{ title: field.value }}
                        onChange={val => field.onChange(val?.title)}
                        getOptionLabel={option => option.title as string}
                        getOptionValue={option => option.title as string}
                        inputId={`contacts.${index}.${attr}`}
                        className={`${hasError(errors, index, attr) ? 'is-invalid' : ''}`}
                    />
                )}
            />
            <ErrorMessege errors={errors} index={index} attr={attr}/>
        </Form.Group>
    )
}