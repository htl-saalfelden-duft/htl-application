import { Form } from "react-bootstrap"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import { GuardianContactTypeKey, guardianContactTypeTitles, TrialDayRegistration } from "../../../models/trialDay.model"

// Radio values are strings; converted with toRegistrationFields before sending
export interface TrialDayRegistrationFieldsInput {
    street: string
    streetNr: string
    zip: string
    city: string
    guardianContactTypeKey: GuardianContactTypeKey | ''
    guardianFirstname: string
    guardianLastname: string
    guardianPhone: string
    guardianEmail: string
    photoConsent: 'yes' | 'no' | ''
    extraAnswer: 'yes' | 'no' | ''
    annotation: string
}

export const emptyRegistrationFields = (guardianEmail = ''): TrialDayRegistrationFieldsInput => ({
    street: '', streetNr: '', zip: '', city: '',
    guardianContactTypeKey: '', guardianFirstname: '', guardianLastname: '', guardianPhone: '', guardianEmail,
    photoConsent: '', extraAnswer: '', annotation: ''
})

export const toRegistrationFields = ({ photoConsent, extraAnswer, ...fields }: TrialDayRegistrationFieldsInput): Partial<TrialDayRegistration> => ({
    ...fields,
    guardianContactTypeKey: fields.guardianContactTypeKey || undefined,
    photoConsent: photoConsent === 'yes',
    extraAnswer: extraAnswer ? extraAnswer === 'yes' : undefined
})

interface Props {
    register: UseFormRegister<any>
    errors: FieldErrors<TrialDayRegistrationFieldsInput>
    extraQuestion?: string
}

const Error = ({ message }: { message?: string }) =>
    message ? <Form.Text className="text-danger">{message}</Form.Text> : null

// Fields every trial day registration needs (SPEC 4.1): address, one guardian,
// photo consent (yes/no without default, SPEC 4.10a) and the optional extra question
const TrialDayRegistrationFields = ({ register, errors, extraQuestion }: Props) => (
    <>
        <h6 className="mt-2">Adresse der Schülerin / des Schülers</h6>
        <div className="row">
            <Form.Group className="mb-3 col-md-8">
                <Form.Label htmlFor="street">Straße *</Form.Label>
                <Form.Control {...register("street", { required: "Bitte Straße eingeben" })} id="street" isInvalid={!!errors.street} />
                <Error message={errors.street?.message} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-4">
                <Form.Label htmlFor="streetNr">Hausnummer *</Form.Label>
                <Form.Control {...register("streetNr", { required: "Bitte Hausnummer eingeben" })} id="streetNr" isInvalid={!!errors.streetNr} />
                <Error message={errors.streetNr?.message} />
            </Form.Group>
        </div>
        <div className="row">
            <Form.Group className="mb-3 col-md-4">
                <Form.Label htmlFor="zip">PLZ *</Form.Label>
                <Form.Control {...register("zip", { required: "Bitte PLZ eingeben" })} id="zip" isInvalid={!!errors.zip} />
                <Error message={errors.zip?.message} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-8">
                <Form.Label htmlFor="city">Ort *</Form.Label>
                <Form.Control {...register("city", { required: "Bitte Ort eingeben" })} id="city" isInvalid={!!errors.city} />
                <Error message={errors.city?.message} />
            </Form.Group>
        </div>

        <h6 className="mt-2">Erziehungsberechtigte:r</h6>
        <div className="row">
            <Form.Group className="mb-3 col-md-4">
                <Form.Label htmlFor="guardianContactTypeKey">Art *</Form.Label>
                <Form.Select {...register("guardianContactTypeKey", { required: "Bitte wählen" })} id="guardianContactTypeKey" isInvalid={!!errors.guardianContactTypeKey}>
                    <option value="">Bitte wählen</option>
                    {Object.entries(guardianContactTypeTitles).map(([key, title]) => <option key={key} value={key}>{title}</option>)}
                </Form.Select>
                <Error message={errors.guardianContactTypeKey?.message} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-4">
                <Form.Label htmlFor="guardianFirstname">Vorname *</Form.Label>
                <Form.Control {...register("guardianFirstname", { required: "Bitte Vorname eingeben" })} id="guardianFirstname" isInvalid={!!errors.guardianFirstname} />
                <Error message={errors.guardianFirstname?.message} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-4">
                <Form.Label htmlFor="guardianLastname">Nachname *</Form.Label>
                <Form.Control {...register("guardianLastname", { required: "Bitte Nachname eingeben" })} id="guardianLastname" isInvalid={!!errors.guardianLastname} />
                <Error message={errors.guardianLastname?.message} />
            </Form.Group>
        </div>
        <div className="row">
            <Form.Group className="mb-3 col-md-6">
                <Form.Label htmlFor="guardianPhone">Telefonnummer *</Form.Label>
                <Form.Control type="tel" {...register("guardianPhone", { required: "Bitte Telefonnummer eingeben" })} id="guardianPhone" isInvalid={!!errors.guardianPhone} />
                <Error message={errors.guardianPhone?.message} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-6">
                <Form.Label htmlFor="guardianEmail">E-Mail-Adresse *</Form.Label>
                <Form.Control type="email" {...register("guardianEmail", { required: "Bitte E-Mail-Adresse eingeben" })} id="guardianEmail" isInvalid={!!errors.guardianEmail} />
                <Error message={errors.guardianEmail?.message} />
            </Form.Group>
        </div>

        {extraQuestion &&
            <Form.Group className="mb-3">
                <Form.Label>{extraQuestion} *</Form.Label>
                <div>
                    <Form.Check inline type="radio" id="extraAnswer-yes" label="Ja" value="yes" {...register("extraAnswer", { required: "Bitte auswählen" })} />
                    <Form.Check inline type="radio" id="extraAnswer-no" label="Nein" value="no" {...register("extraAnswer", { required: "Bitte auswählen" })} />
                </div>
                <Error message={errors.extraAnswer?.message} />
            </Form.Group>
        }

        <Form.Group className="mb-3">
            <Form.Label>Fotoaufnahmen *</Form.Label>
            <Form.Check type="radio" id="photoConsent-yes" label="Ja, ich stimme zu, dass beim Schnuppertag Fotos meines Kindes gemacht und von der Schule veröffentlicht werden dürfen (z.B. Homepage, Jahresbericht)." value="yes" {...register("photoConsent", { required: "Bitte auswählen" })} />
            <Form.Check type="radio" id="photoConsent-no" label="Nein, ich stimme nicht zu." value="no" {...register("photoConsent", { required: "Bitte auswählen" })} />
            <Error message={errors.photoConsent?.message} />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label htmlFor="annotation">Bemerkung</Form.Label>
            <Form.Control as="textarea" rows={2} {...register("annotation")} id="annotation" placeholder="Wichtige Hinweise für den Schnuppertag" />
        </Form.Group>
    </>
)

export default TrialDayRegistrationFields
