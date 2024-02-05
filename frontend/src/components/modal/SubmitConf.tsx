import { Button, Modal } from "react-bootstrap"

interface Props {
    show: boolean
    onClose: () => void
    onSubmit: () => void
}

const SubmitConfirmation = (props: Props) => {

    const { show, onClose, onSubmit } = props

    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Antrag abschicken</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Ihre Daten sind vollständig und können abgeschickt werden!</p>
                <p>Stellen sie sicher, dass die Daten korrekt sind. Eine anschließende Änderung kann nur mehr im Sekreteriat der HTL-Saalfelden erfolgen.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    Nochmals kontrollieren
                </Button>
                <Button variant="outline-primary" onClick={onSubmit}>
                    Absenden
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SubmitConfirmation