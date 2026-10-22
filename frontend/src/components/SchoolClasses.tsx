import { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Form, Row, Table } from "react-bootstrap"
import { Files, Pencil, PlusLg } from "react-bootstrap-icons"
import { toast } from "react-toastify"
import { ApiService } from "../services/api.service"
import { SchoolClass } from "../models/schoolClass.model"
import SchoolClassEdit from "./modal/SchoolClassEdit"
import SchoolClassCopy from "./modal/SchoolClassCopy"

// Admin only. School classes are never deleted, because applications of
// previous years still reference them; they are deactivated instead.
export const SchoolClasses = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([])
    const [showEdit, setShowEdit] = useState(false)
    const [editSchoolClass, setEditSchoolClass] = useState<SchoolClass>()
    const [showCopy, setShowCopy] = useState(false)
    const [onlyActive, setOnlyActive] = useState(false)

    const load = () => {
        apiService.getPath<SchoolClass[]>(SchoolClass, 'all').then(setSchoolClasses)
    }

    useEffect(() => {
        load()
    }, [])

    const activeYears = Array.from(new Set(schoolClasses.filter(sc => sc.active).map(sc => sc.year))).sort()
    const locations = Array.from(new Set(schoolClasses.map(sc => sc.location).filter((location): location is string => !!location))).sort()
    const visible = onlyActive ? schoolClasses.filter(sc => sc.active) : schoolClasses

    const openEdit = (schoolClass?: SchoolClass) => {
        setEditSchoolClass(schoolClass)
        setShowEdit(true)
    }

    const closeEdit = () => {
        setShowEdit(false)
        setEditSchoolClass(undefined)
    }

    const toggleActive = (schoolClass: SchoolClass, active: boolean) => {
        apiService.save<SchoolClass>(SchoolClass, { ...schoolClass, active })
            .then(() => {
                toast(active ? 'Fachrichtung aktiviert.' : 'Fachrichtung deaktiviert.')
                load()
            }, (err) => toast(err.response.data.message, { type: 'error' }))
    }

    return (
        <>
            <Row className='justify-content-md-center'>
                <div className="d-flex justify-content-between mt-5">
                    <h4>Fachrichtungen</h4>
                    <div>
                        <Button
                            variant="outline-secondary"
                            className="mb-2 me-2"
                            onClick={() => setShowCopy(true)}
                            disabled={!schoolClasses.length}
                            title="Fachrichtungen aus einem Vorjahr übernehmen"
                        >
                            <Files /><span className="ms-2">Vom Vorjahr übernehmen</span>
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="mb-2"
                            onClick={() => openEdit()}
                            title="Neue Fachrichtung anlegen"
                        >
                            <PlusLg />
                        </Button>
                    </div>
                </div>
                {activeYears.length > 1 && (
                    <Alert variant="warning">
                        Es sind Fachrichtungen aus mehreren Schuljahren aktiv ({activeYears.join(', ')}). Bewerber:innen sehen gleichnamige Fachrichtungen dadurch mehrfach.
                    </Alert>
                )}
                <Card>
                    <CardBody>
                        <Form.Check
                            type="switch"
                            id="onlyActive"
                            className="mb-3"
                            label="Nur aktive anzeigen"
                            checked={onlyActive}
                            onChange={e => setOnlyActive(e.target.checked)} />
                        <Table hover className="application-table">
                            <thead>
                                <tr>
                                    <th>Schuljahr</th>
                                    <th>Bezeichnung</th>
                                    <th>Standort</th>
                                    <th>SFKZ</th>
                                    <th>Max. Schüler:innen</th>
                                    <th>Aktiv</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(schoolClass => (
                                    <tr key={schoolClass.id} className={schoolClass.active ? '' : 'text-muted'}>
                                        <td>{schoolClass.year}</td>
                                        <td>{schoolClass.title}</td>
                                        <td>{schoolClass.location ?? <span className="text-danger">fehlt</span>}</td>
                                        <td>{schoolClass.sfkz}</td>
                                        <td>{schoolClass.maxPupils}</td>
                                        <td>
                                            <Form.Check
                                                type="switch"
                                                id={`active-${schoolClass.id}`}
                                                checked={schoolClass.active}
                                                onChange={e => toggleActive(schoolClass, e.target.checked)} />
                                        </td>
                                        <td>
                                            <Button variant="outline-primary" onClick={() => openEdit(schoolClass)}><Pencil /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Row>
            <SchoolClassEdit
                show={showEdit}
                schoolClass={editSchoolClass}
                defaultYear={schoolClasses[0]?.year}
                locations={locations}
                onClose={closeEdit}
                onSaved={() => { closeEdit(); load() }} />
            <SchoolClassCopy
                show={showCopy}
                schoolClasses={schoolClasses}
                onClose={() => setShowCopy(false)}
                onSaved={() => { setShowCopy(false); load() }} />
        </>
    )
}
