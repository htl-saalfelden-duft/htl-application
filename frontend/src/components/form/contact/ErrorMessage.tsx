import { FieldErrors } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model";
import { Contact } from "../../../models/contact.model";
import { Form } from "react-bootstrap";
import { hasError } from "./contact-form.util";

interface Props {
    errors: FieldErrors<Applicant>
    index: number
    attr: keyof Contact
}
export const ErrorMessege = (props: Props) => {
    const { errors, index, attr } = props;

    return (
        <>
            {hasError(errors, index, attr) && (
                    <Form.Text className="text-danger">
                        {errors.contacts![index]![attr]?.message}
                    </Form.Text>
            )}
        </>
    )
}