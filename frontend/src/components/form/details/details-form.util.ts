import { FieldErrors } from "react-hook-form";
import { Applicant } from "../../../models/applicant.model";
import { ApplicantDetails } from "../../../models/applicant-details.model";


const hasError = (errors: FieldErrors<Applicant>, attr: keyof ApplicantDetails) => !!(errors.details && errors.details[attr])

export { hasError }