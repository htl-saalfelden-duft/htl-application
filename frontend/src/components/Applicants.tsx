import { FormEvent, useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { Applicant, ApplicantStatus } from "../models/applicant.model"
import { Button, Card, CardBody, Form, Row, Table } from "react-bootstrap"
import { DatabaseDown, FileEarmarkPdf, Funnel, FunnelFill, Pencil, PlusLg, Trash } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"
import ApplicantNew from "./modal/ApplicantNew"
import "./Applicants.scss"
import ConfirmationPdf from "./modal/ConfirmationPdf"
import { toast } from "react-toastify"
import moment from "moment"
import DeleteApplicantConfirmation from "./modal/DeleteConfirmation"
import { useAuth } from "../contexts/auth.context"
import fileDownload from "js-file-download"
import DeleteConfirmation from "./modal/DeleteConfirmation"

export const Applicants = () => {
    const apiService = useMemo(() => new ApiService(), [])
    const { isAdmin } = useAuth()
    const navigate = useNavigate()

    const [applicants, setApplicants] = useState<Applicant[]>()
    const [applicantStatuses, setApplicantStatuses] = useState<ApplicantStatus[]>()
    const [showApplicantNew, setShowApplicantNew] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const [deleteConfirmationApplicant, setDeleteConfirmationApplicant] = useState<Applicant>()
    const [confirmationPdfApplicant, setConfirmationPdfApplicant] = useState<Applicant>()

    const loadApplicants = (search: string = '') => {
        let params: any = { all: showAll}
        if (search) params.search = search
        
        apiService.get<Applicant[]>(Applicant, undefined, params)
        .then(result => {
            setApplicants(result)
        })
    }

    const saveApplicant = () => {
        const applicant: Applicant = {
            id: confirmationPdfApplicant?.id,
            statusKey: 'registered',
            registeredAt: new Date()
        }

        return apiService.save<Applicant>(Applicant, applicant)
    }

    const loadApplicantStatuses = () => {
        apiService.get<ApplicantStatus[]>(ApplicantStatus)
        .then(result => {
            setApplicantStatuses(result)
        })   
    }

    useEffect(() => {
        loadApplicants()
        loadApplicantStatuses()
    }, [showAll])

    const onCloseApplicantNew = () => {
        setShowApplicantNew(false)
        loadApplicants()
    }

    const openApplicant = (id: string) => {
        navigate("/applicant", { state: {id} })
    }

    const deleteApplicant = () => {
        const id = deleteConfirmationApplicant!.id!

        return apiService.delete<Applicant>(Applicant, id)
        .then(() => {
            toast('Bewerber gelöscht.')
            setDeleteConfirmationApplicant(undefined)
            loadApplicants()
        })
    }

    const onConfirmationSubmit = () => {
        saveApplicant()
        .then(() => {
            toast('Das Anmeldedatum wurde gespeichert.')
            setConfirmationPdfApplicant(undefined)
            loadApplicants()
        })
    }

    const download = () => {
        apiService.getPath<any>(Applicant, 'export-csv', undefined, {
            responseType: 'blob',
            params: {statusKey: "registered"}
        })
        .then(result => {
            const filename = `applicants-${new Date().toISOString()}.csv`
            fileDownload(result, filename)
        })
    }

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.target as HTMLFormElement
        const input = form.elements.namedItem('search') as HTMLInputElement
        loadApplicants(input.value)
    }

    return (
        <>
        <Row className='justify-content-md-center'>
            <div className="d-flex justify-content-between mt-5">
                <h4>Bewerber</h4>
                <div className="mb-2">
                    <Form style={{display: 'inline-block'}} onSubmit={handleSearch}>
                        <Form.Group className="mb-3">
                            <Form.Control type="text" placeholder="Suche" name="search" />
                        </Form.Group>
                    </Form>
                    
                    { isAdmin && <Button
                        variant="outline-secondary"
                        className="ms-2"
                        onClick={() => download()}
                        title="CSV download"
                    >
                        <DatabaseDown/>
                    </Button>}

                    <Button
                        variant="outline-secondary"
                        className="ms-2"
                        onClick={() => setShowAll(current => !current)}
                        title={showAll ? "Bewerber nur von diesem Jahr anzeigen" : "Alle Bewerber anzeigen"}
                    >
                        { showAll ? <Funnel/> : <FunnelFill/> }
                    </Button>
                    <Button
                        variant="outline-secondary"
                        className="ms-2"
                        onClick={() => setShowApplicantNew(true)}
                        title="Neuen Bewerber anlegen"
                    >
                        <PlusLg/>
                    </Button>
                </div>
            </div>
            <Card >
                <CardBody>
                    <Table hover className="applicants-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vorname</th>
                                <th>Nachname</th>
                                <th style={{width: '30%'}}>Abteilung Prio.1</th>
                                <th>Status</th>
                                <th>Anmeldedatum</th>
                                <th>Antrags-Email</th>
                                <th>Email bestätigt</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants?.map((applicant, index) => (
                                <tr key={applicant.id} className={`${applicant.statusKey === 'applied' && 'applied'}`}>
                                    <td>{index + 1}</td>
                                    <td>{applicant.details?.firstname}</td>
                                    <td>{applicant.details?.lastname}</td>
                                    <td>{(applicant.applications && applicant.applications[0]?.schoolClass?.title) || '-'}</td>
                                    <td>{applicantStatuses?.find(as => as.key === applicant.statusKey)?.title || ''}</td>
                                    <td>{applicant.registeredAt && moment(applicant.registeredAt).format('DD.MM.YYYY')}</td>
                                    <td>{applicant.email}</td>
                                    <td><div className="form-check"><input type="checkbox" className="form-check-input" checked={applicant.emailConfirmed} disabled /></div></td>
                                    <td>
                                        <div className="d-flex" style={{gap: '6px'}}>
                                            <Button variant="outline-primary" onClick={() => {openApplicant(applicant.id!)}}><Pencil /></Button>
                                            <Button variant="outline-danger" onClick={() => {setConfirmationPdfApplicant(applicant)}} disabled={applicant.statusKey==="created"}><FileEarmarkPdf /></Button>
                                            <Button variant="danger" onClick={() => {setDeleteConfirmationApplicant(applicant)}} disabled={(applicant.statusKey==="registered" || applicant.statusKey==="completed") && !isAdmin}><Trash /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Row>
        <ApplicantNew show={showApplicantNew} onClose={onCloseApplicantNew} />
        <ConfirmationPdf 
            show={!!confirmationPdfApplicant}
            applicant={confirmationPdfApplicant!}
            onClose={() => setConfirmationPdfApplicant(undefined)}
            onSubmit={onConfirmationSubmit} />
        <DeleteConfirmation 
            show={!!deleteConfirmationApplicant}
            entityName="Bewerber"
            onSubmit={deleteApplicant}
            onClose={() => setDeleteConfirmationApplicant(undefined)} />
        </>
    )
}