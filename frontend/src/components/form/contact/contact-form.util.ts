import { FieldErrors } from "react-hook-form";
import { Applicant } from "../../../models/applicant.model";
import { Contact } from '../../../models/contact.model'


const hasError = (errors: FieldErrors<Applicant>, index: number, attr: keyof Contact) => !!(errors.contacts && errors.contacts[index] && errors.contacts[index]![attr])

export { hasError }