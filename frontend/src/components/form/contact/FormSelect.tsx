import { Form } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { Applicant } from "../../../models/applicant.model"
import { Contact as IContact } from '../../../models/contact.model'
import { useContact } from "../../../contexts/contact.context"

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
                    <AsyncSelect
                        ref={field.ref}
                        loadOptions={loadOptions}
                        defaultOptions
                        value={{ title: field.value }}
                        onChange={val => field.onChange(val?.title)}
                        getOptionLabel={option => option.title as string}
                        inputId={`contacts.${index}.${attr}`}
                    />
                )}
            />
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