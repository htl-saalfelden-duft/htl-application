import { FieldErrors } from "react-hook-form"
import { Applicant } from "../../../models/applicant.model";
import { Form } from "react-bootstrap";
import { SchoolReport } from "../../../models/schoolReport.model";

interface Props {
    errors: FieldErrors<Applicant>
    attr: keyof SchoolReport
}
export const ErrorMessege = (props: Props) => {
    const { errors, attr } = props;

    return (
        <>
            {errors.schoolReport &&
                errors.schoolReport[attr] && (
                    <Form.Text className="text-danger">
                        {errors.schoolReport[attr]?.message}
                    </Form.Text>
            )}
        </>
    )
}