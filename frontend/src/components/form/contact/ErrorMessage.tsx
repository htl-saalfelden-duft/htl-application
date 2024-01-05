import { FieldErrors } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model";
import { Contact } from "../../../models/contact.model";
import { Form } from "react-bootstrap";

interface Props {
    errors: FieldErrors<Applicant>
    index: number
    attr: keyof Contact
}
export const ErrorMessege = (props: Props) => {
    const { errors, index, attr } = props;

    return (
        <>
            {errors.contacts &&
                errors.contacts[index] &&
                errors.contacts[index]![attr] && (
                    <Form.Text className="text-danger">
                        {errors.contacts![index]![attr]?.message}
                    </Form.Text>
            )}
        </>
    )
}