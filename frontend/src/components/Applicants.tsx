import { useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { Applicant } from "../models/applicant.model"
import { Button, Card, CardBody, Row, Table } from "react-bootstrap"
import { Pencil, PlusLg } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"
import { AuthService } from "../services/auth.service"
import { toast } from "react-toastify"
import ApplicantNew, { IApplicantNewFormInput } from "./modal/ApplicantNew"

export const Applicants = () => {
    const apiService = useMemo(() => new ApiService(), [])
    const { signUpApplicant } = useMemo(() => new AuthService(), [])
    const navigate = useNavigate()

    const [applicants, setApplicants] = useState<Applicant[]>()
    const [showNewApplicant, setShowNewApplicant] = useState(false)

    const loadApplicants = () => {
        apiService.get<Applicant[]>(Applicant)
        .then(result => {
            setApplicants(result)
        })
    }

    useEffect(() => {
        loadApplicants()
    }, [])

    const openApplicant = (id: string) => {
        navigate("/applicant", { state: {id} })
    }

    const newApplicant = (formData: IApplicantNewFormInput) => {
        const applicant = {...{
            emailConfirmed: true,
        }, ...formData}
        signUpApplicant(applicant)
        .then(() => {
            setShowNewApplicant(false)
            toast("Bewerber angelegt")
            loadApplicants()
        }, (err) => {
            toast(err.response.data.message)
        })
    }

    return (
        <>
        <Row className='justify-content-md-center'>
            <div className="d-flex justify-content-between mt-5">
                <h4>Bewerberdaten</h4>
                <Button
                    variant="outline-secondary"
                    className="mb-2"
                    onClick={() => setShowNewApplicant(true)}
                    title="Neuen Bewerber anlegen"
                >
                    <PlusLg/>
                </Button>
            </div>
            <Card >
                <CardBody>
                    <Table striped bordered hover className="application-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vorname</th>
                                <th>Nachname</th>
                                <th>Abteilung</th>
                                <th>Status</th>
                                <th>Antrags-Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants?.map((applicant, index) => (
                                <tr key={applicant.id}>
                                    <td>{index + 1}</td>
                                    <td>{applicant.details?.firstname}</td>
                                    <td>{applicant.details?.lastname}</td>
                                    <td>{(applicant.applications && applicant.applications[0]?.schoolClass?.title) || '-'}</td>
                                    <td>{(applicant.applications && applicant.applications[0]?.statusKey) || '-'}</td>
                                    <td>{applicant.email}</td>
                                    <td>
                                        <Button variant="outline-primary" className="me-2" onClick={() => {openApplicant(applicant.id as string)}}><Pencil /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Row>
        <ApplicantNew show={showNewApplicant} onSubmit={newApplicant} onClose={() => setShowNewApplicant(false)} />
        </>
    )
}