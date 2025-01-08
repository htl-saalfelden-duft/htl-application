import { Button, Modal } from "react-bootstrap"
import { ExclamationCircle } from "react-bootstrap-icons"

interface Props {
    show: boolean
    onClose: () => void
    onSubmit: () => void
}

const DeleteApplicantConfirmation = (props: Props) => {

    const { show, onClose, onSubmit } = props

    return (
        <Modal show={show} onHide={onClose} size="sm">
            <Modal.Header closeButton className="text-danger">
                <Modal.Title><ExclamationCircle size={32} className="me-2"/>Bewerber löschen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Wollen Sie den Bewerber wirklich löschen?</p>
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

export default DeleteApplicantConfirmation