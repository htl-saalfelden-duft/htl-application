import { useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { Button, Card, CardBody, Row, Table } from "react-bootstrap"
import { Pencil, PlusLg } from "react-bootstrap-icons"
import { User } from "../models/user.model"
import UserNew from "./modal/UserNew"

export const Users = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const [users, setUsers] = useState<User[]>()
    const [showUserNew, setShowUserNew] = useState(false)


    const loadUsers = () => {
        apiService.get<User[]>(User)
        .then(result => {
            setUsers(result)
        })
    }

    useEffect(() => {
        loadUsers()
    }, [])

    return (
        <>
        <Row className='justify-content-md-center'>
            <div className="d-flex justify-content-between mt-5">
                <h4>Users</h4>
                <Button
                    variant="outline-secondary"
                    className="mb-2"
                    onClick={() => setShowUserNew(true)}
                    title="Neuen User anlegen"
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
                                <th>Name</th>
                                <th>email</th>
                                <th>Rechte</th>
                                <th>activ</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.userRoleKey}</td>
                                    <td><div className="form-check"><input type="checkbox" className="form-check-input" checked={user.active} disabled /></div></td>
                                    <td>
                                        <Button variant="outline-primary" className="me-2" onClick={() => {}} disabled><Pencil /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </Row>
        <UserNew show={showUserNew} onClose={() => setShowUserNew(false)} />
        </>
    )
}