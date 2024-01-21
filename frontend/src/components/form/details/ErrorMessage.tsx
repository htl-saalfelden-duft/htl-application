import { FieldErrors } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model";
import { Form } from "react-bootstrap";
import { ApplicantDetails } from "../../../models/applicant-details.model";
import { hasError } from "./details-form.util";

interface Props {
    errors: FieldErrors<Applicant>
    attr: keyof ApplicantDetails
}
export const ErrorMessege = (props: Props) => {
    const { errors, attr } = props;

    return (
        <>
            {hasError(errors, attr) && (
                    <Form.Text className="text-danger">
                        {errors.details![attr]?.message}
                    </Form.Text>
            )}
        </>
    )
}