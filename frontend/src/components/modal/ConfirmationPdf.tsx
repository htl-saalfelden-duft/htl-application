import { PDFViewer } from "@react-pdf/renderer"
import { Button, Modal } from "react-bootstrap"
import { Confirmation } from "../pdf/Confirmation"
import "./ConfirmationPdf.scss"
import { Applicant } from "../../models/applicant.model"

interface Props {
    show: boolean
    onClose: () => void
    applicant: Applicant
}

const ConfirmationPdf = (props: Props) => {

    const { show, onClose, applicant } = props

    return (
        <Modal show={show} onHide={onClose} size="lg" className="pdf-confirmation">
            <Modal.Body>
                <PDFViewer width="100%" height="100%">
                    <Confirmation applicant={applicant} />
                </PDFViewer>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Schließen
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ConfirmationPdf