import { useEffect, useMemo, useState } from "react"
import { ApiService } from "../services/api.service"
import { Button, Card, CardBody, Row, Table } from "react-bootstrap"
import { Pencil, PlusLg, Trash } from "react-bootstrap-icons"
import { User } from "../models/user.model"
import UserEdit from "./modal/UserEdit"
import DeleteConfirmation from "./modal/DeleteConfirmation"
import { toast } from "react-toastify"

export const Users = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const [users, setUsers] = useState<User[]>()
    const [showUserEdit, setShowUserEdit] = useState(false)
    const [editUserID, setEditUserID] = useState<string | undefined>()
    const [deleteConfirmationUserID, setDeleteConfirmationUserID] = useState<string>()
    


    const loadUsers = () => {
        apiService.get<User[]>(User)
            .then(result => {
                setUsers(result)
            })
    }

    const editUser = (userID: string) => {
        setEditUserID(userID)
        setShowUserEdit(true)
    }

    const newUser = () => {
        setEditUserID(undefined)
        setShowUserEdit(true)
    }

    const deleteUser = () => {
        apiService.delete(User, deleteConfirmationUserID!)
            .then(() => {
                toast('User gelöscht.')
                setDeleteConfirmationUserID(undefined)
                loadUsers()
            })
    }

    const closeEditUser = () => {
        setEditUserID(undefined)
        setShowUserEdit(false)
        loadUsers()
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
                        onClick={() => newUser()}
                        title="Neuen User anlegen"
                    >
                        <PlusLg />
                    </Button>
                </div>
                <Card >
                    <CardBody>
                        <Table hover className="application-table">
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
                                            <Button variant="outline-primary" className="me-2" onClick={() => { editUser(user.id) }}><Pencil /></Button>
                                            <Button variant="danger" className="me-2" onClick={() => { setDeleteConfirmationUserID(user.id) }}><Trash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Row>
            <UserEdit show={showUserEdit} userID={editUserID} onClose={() => closeEditUser()} />
            <DeleteConfirmation
                show={!!deleteConfirmationUserID}
                entityName="User"
                onSubmit={deleteUser}
                onClose={() => setDeleteConfirmationUserID(undefined)} />
        </>
    )
}