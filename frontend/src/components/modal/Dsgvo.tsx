import { Button, Modal } from "react-bootstrap"

interface Props {
    show: boolean
    onClose: () => void
}

const Dsgvo = (props: Props) => {

    const { show, onClose } = props

    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Datenschutzverordnung</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h3>Datenschutzgrundverordnung</h3>

                <h4>Einwilligung</h4>

                <h4>Art. 7 DSGVO</h4>

                <p>Ich bin damit einverstanden, dass die angeführten personenbezogenen Daten ausschließlich für schulische und organisatorische Zwecke teilweise oder vollständig verarbeitet werden.</p>

                <h4>Speicherdauer:</h4>
                <p>Die personenbezogenen Daten werden von der Höhere Technische Bundeslehranstalt Saalfelden nur so lange gespeichert, wie es unter Einhaltung der einschlägigen gesetzlichen Bestimmungen zur Erfüllung des jeweils genannten Zwecks notwendig ist, oder solange gespeichert, als gesetzliche Aufbewahrungsfristen bestehen oder Verjährungsfristen betreffen potentieller Rechtsansprüche noch offen sind.</p>

                <h4>Als personenbezogene Daten werden verarbeitet:</h4>
                <p>Vor- und Zuname der/des Studierenden, Wohnadresse, Geburtsdatum, IP-Adressen und Kontaktdaten des Internetproviders, Versicherungsnummer, Religionsbekenntnis, Muttersprache, Staatsbürgerschaft, Telefonnummern.</p>

                <h4>Verwendungszwecke für die personenbezogene Datenverarbeitung sind:</h4>
                <p>WebUntis inkl. Fotos (elektronisches Tagebuch), Klassenlisten, Schulbuchlisten, AUVA Meldungen, Netz- und E-Mail-Account, elektronische Zutrittssysteme, Schulgeldverwaltung (edu.PAY), Schulfotografie, Bezirksverwaltungsbehörden, Magistrat, Polizei.</p>

                <p>Zudem gebe ich die Einwilligung, dass Fotos bzw. Videos veröffentlicht werden dürfen (z.B. Homepage der Schule, Jahresbericht der Schule, lokale Medien und Berichte in Tageszeitungen, Rundfunk und Fernsehen).</p>

                <p>Dem Unterfertigten steht grundsätzlich das Recht auf Auskunft, Berechtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und Widerspruch zu. Diese Rechte können gegenüber der Höhere Technische Bundeslehranstalt Saalfelden geltend gemacht werden, wenn die Verarbeitung der personenbezogenen Daten gegen geltendes Datenschutzrecht verstößt oder datenschutzrechtliche Ansprüche sonst in einer Weise verletzt worden sind. Dann ist eine Beschwerde an die Österreichische Datenschutzbehörde als zuständige Aufsichtsbehörde gemäß Art. 77 DSGVO zu erheben. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Schließen
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default Dsgvo