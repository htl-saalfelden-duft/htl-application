import { Button, Modal } from "react-bootstrap"
import { ExclamationCircle } from "react-bootstrap-icons"

interface Props {
    show: boolean
    title: string
    text: string
    confirmLabel?: string
    onClose: () => void
    onSubmit: () => void
}

const Confirmation = (props: Props) => {

    const { show, title, text, confirmLabel = 'Ja bitte', onClose, onSubmit } = props

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton className="text-danger">
                <Modal.Title><ExclamationCircle size={32} className="me-2"/>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{text}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant="outline-danger" onClick={onSubmit}>
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default Confirmation
