import { useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { Applicant } from "../models/applicant.model"
import { Button, Card, CardBody, Row, Table } from "react-bootstrap"
import { FileEarmarkPdf, Pencil, PlusLg } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"
import ApplicantNew from "./modal/ApplicantNew"
import { toast } from "react-toastify"

export const Applicants = () => {
    const apiService = useMemo(() => new ApiService(), [])
    const navigate = useNavigate()

    const [applicants, setApplicants] = useState<Applicant[]>()
    const [showApplicantNew, setShowApplicantNew] = useState(false)

    const loadApplicants = () => {
        apiService.get<Applicant[]>(Applicant)
        .then(result => {
            setApplicants(result)
        })
    }

    useEffect(() => {
        loadApplicants()
    }, [])

    const onCloseApplicantNew = () => {
        setShowApplicantNew(false)
        loadApplicants()
    }

    const openApplicant = (id: string) => {
        navigate("/applicant", { state: {id} })
    }

    const createPdf = (idf: string) => {
        toast("Comming soon!")
    }

    return (
        <>
        <Row className='justify-content-md-center'>
            <div className="d-flex justify-content-between mt-5">
                <h4>Bewerber</h4>
                <Button
                    variant="outline-secondary"
                    className="mb-2"
                    onClick={() => setShowApplicantNew(true)}
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
                                <th>Abteilung Prio.1</th>
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
                                    <td>{applicant.statusKey}</td>
                                    <td>{applicant.email}</td>
                                    <td>
                                        <Button variant="outline-primary" className="me-2" onClick={() => {openApplicant(applicant.id!)}}><Pencil /></Button>
                                        <Button variant="outline-danger" className="me-2" onClick={() => {createPdf(applicant.id!)}}><FileEarmarkPdf /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Row>
        <ApplicantNew show={showApplicantNew} onClose={onCloseApplicantNew} />
        </>
    )
}