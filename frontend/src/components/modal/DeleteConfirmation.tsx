import { Button, Modal } from "react-bootstrap"
import { ExclamationCircle } from "react-bootstrap-icons"

interface Props {
    show: boolean
    entityName: string
    onClose: () => void
    onSubmit: () => void
}

const DeleteConfirmation = (props: Props) => {

    const { show, entityName, onClose, onSubmit } = props

    return (
        <Modal show={show} onHide={onClose} size="sm">
            <Modal.Header closeButton className="text-danger">
                <Modal.Title><ExclamationCircle size={32} className="me-2"/>{entityName} löschen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Wollen Sie das wirklich machen?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant="outline-danger" onClick={onSubmit}>
                    Ja bitte
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteConfirmation