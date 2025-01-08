import { PDFViewer } from "@react-pdf/renderer"
import { Button, Modal } from "react-bootstrap"
import { Confirmation } from "../pdf/Confirmation"
import "./ConfirmationPdf.scss"
import { Applicant } from "../../models/applicant.model"

interface Props {
    show: boolean
    onClose: () => void
    onSubmit: () => void
    applicant: Applicant
}

const ConfirmationPdf = (props: Props) => {

    const { show, onClose, onSubmit, applicant } = props

    return (
        <Modal show={show} onHide={onClose} size="lg" className="pdf-confirmation">
            <Modal.Body>
                <PDFViewer width="100%" height="100%">
                    <Confirmation applicant={applicant} />
                </PDFViewer>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant="danger" onClick={onSubmit} disabled={applicant?.statusKey !== "applied"}>
                    Angemeldet setzen
                </Button>                
            </Modal.Footer>
        </Modal>
    )
}

export default ConfirmationPdf