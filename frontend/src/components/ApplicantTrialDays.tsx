import { useEffect, useMemo, useState } from "react"
import { Alert, Card, CardBody, Table } from "react-bootstrap"
import moment from "moment"
import { ApiService } from "../services/api.service"
import { Applicant } from "../models/applicant.model"
import { formatTrialDayDate, formatTrialDayTime } from "../models/trialDay.model"
import { RegistrationStatus } from "./TrialDays"

interface Props {
    applicantID: string
}

// Read-only info for the administration in the applicant view (SPEC 7.5)
const ApplicantTrialDays = ({ applicantID }: Props) => {
    const apiService = useMemo(() => new ApiService(), [])
    const [applicant, setApplicant] = useState<Applicant>()

    useEffect(() => {
        apiService.get<Applicant>(Applicant, applicantID).then(setApplicant)
    }, [applicantID])

    return (
        <>
            {applicant?.anonymizedAt &&
                <Alert variant="secondary" className="mt-3">
                    Diese Bewerbung wurde am {moment(applicant.anonymizedAt).format('DD.MM.YYYY')} anonymisiert.
                </Alert>
            }
            {!!applicant?.trialDayRegistrations?.length &&
                <Card className="mt-3">
                    <CardBody>
                        <h6>Schnuppertage</h6>
                        <Table size="sm" className="mb-0">
                            <thead>
                                <tr>
                                    <th>Fachrichtung</th>
                                    <th>Datum</th>
                                    <th>Status</th>
                                    <th>Telefon</th>
                                    <th>Bemerkung</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicant.trialDayRegistrations.map(registration => (
                                    <tr key={registration.id}>
                                        <td>{registration.trialDay?.schoolClass?.title}</td>
                                        <td>{formatTrialDayDate(registration.trialDay!)}, {formatTrialDayTime(registration.trialDay!)}</td>
                                        <td><RegistrationStatus registration={registration} /></td>
                                        <td>{registration.guardianPhone}</td>
                                        <td style={{ whiteSpace: 'pre-line' }}>{registration.annotation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            }
        </>
    )
}

export default ApplicantTrialDays
