import { Alert, Button, Form, ListGroup } from "react-bootstrap"
import { Applicant } from "../models/applicant.model"
import { useFormContext } from "react-hook-form"
import { useState } from "react"
import "./HomeTab.scss"
import { TabType, useTabs } from "../contexts/tabs.context"
import { toast } from "react-toastify"
import Dsgvo from "./modal/Dsgvo"
import { useNavigate } from "react-router-dom"
import { Plus, Trash } from "react-bootstrap-icons"
import ContactNew, { IContactNewFormInput } from "./modal/ContactNew"

interface Props {
    onSave: () => void
    locked: boolean
}

const HomeTab = (props: Props) => {
    const {onSave, locked} = props

    const [validated, setValidated] = useState(false)
    const [showDsgvo, setShowDsgvo] = useState(false)
    const [showContactNew, setShowContactNew] = useState(false)

    const {
        contactTabs,
        addContactTab,
        removeContactTab,
        setCurrentTab,
        admin,
        schoolReportEnabled,
        setSchoolReportEnabled,
    } = useTabs()

    const {
        trigger,
        getValues,
        reset,
        register,
        formState: { errors, isValid }
    } = useFormContext<Applicant>()

    const applicant = getValues()
    const navigate = useNavigate()

    const validateForm = () => {
        trigger()
        setValidated(true)
        if (isValid) {
            toast("Daten wurden überprüft und sind vollständig!", { type: 'success' })
        } else {
            toast("Daten wurden überprüft und sind leider nicht vollständig. Bitte überprüfen Sie Ihre Eingabe.", { type: 'error' })
            console.log(errors)
        }
    }

    const changeTab = (type: TabType, active = true) => {
        if (active) {
            setCurrentTab(type)
        }
    }

    const errorClass = (hasError: boolean) => {
        if (validated) {
            return hasError ? 'invalid' : 'valid'
        }
    }

    const handleAddContact = (formData: IContactNewFormInput) => {
        addContactTab(formData.contactType)
        setShowContactNew(false)
    }

    const handleRemoveContact = (index: number) => {
        if(contactTabs.length > 2) { // 2 because of applicant
            removeContactTab(index)

            setValidated(false)
    
            const applicant = getValues()
            applicant.contacts?.splice(index, 1)
    
            reset(applicant)
        } else {
            toast("Mindestens ein Erziehungsberechtigter muss angegeben werden!", {type: 'info'})
        }
    }

    const handleEnabledSchoolReport = () => {
        setValidated(false)

        setSchoolReportEnabled(enabled => !enabled)
    }

    return (
        <>
            { !admin ?
            <>
                <h4 className="mt-4 mb-4">Sehr geehrte Erziehungsberechtigte, <br/>sehr geehrte BewerberInnen! </h4>
                <p>Sie befinden sich im Bewerber-Portal der HTL Saalfelden. Bitte füllen Sie das Formular vollständig aus.</p>
            </>
            : 
            <>
                <h4>Bewerber: {applicant.details?.firstname} {applicant.details?.lastname}</h4>
            </>
            }
            <ListGroup className="mt-4 mb-3">
                <ListGroup.Item variant="secondary"><small>Folgende Daten werden für die Anmeldung benötigt:</small></ListGroup.Item>

                <ListGroup.Item
                    className={errorClass(!!errors.applications)}
                    onClick={() => changeTab('applications')}>
                    Bewerbungen <br /><small>(min. eine Fachrichtung)</small>
                </ListGroup.Item>

                <ListGroup.Item
                    className={errorClass(!!errors.details)}
                    onClick={() => changeTab('details')}>
                    Daten des Bewerbers <br /><small>(vollstandig ausgefüllt)</small>
                </ListGroup.Item>

                <ListGroup.Item
                    className={errorClass(!!errors?.contacts && !!errors.contacts[0])}
                    onClick={() => changeTab('contact-applicant')} >
                    Kontakt des Bewerbers <br /><small>(vollstandig ausgefüllt)</small>
                </ListGroup.Item>

                <ListGroup.Item variant="secondary">
                    <div className="d-flex justify-content-between">
                        <div>
                            <small>Bitte geben Sie die Kontaktdaten aller Erziehungsberechtigten ein. Aktivieren Sie dafür die erforderlichen Felder.</small><br/>
                            <small>(Mindestens ein Elternteil muss angegeben werden)</small>
                        </div>
                        <div>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowContactNew(true)}
                                title="Kontakt hinzufügen"
                                size="sm"
                                disabled={locked}>
                                <Plus/>
                            </Button>
                        </div>
                    </div>
                </ListGroup.Item>
                {contactTabs.map((ct, index) => !ct.fixed &&
                    <ListGroup.Item
                        key={index}
                        className={`d-flex justify-content-between ${errorClass(!!errors?.contacts && !!errors.contacts[index])}`}>
                        <div className="w-100" onClick={() => changeTab(ct.type)}>{ct.title}</div>
                        <Button
                            variant="outline-secondary"
                            onClick={() => handleRemoveContact(index)}
                            title="Kontakt entfernen"
                            size="sm"
                            disabled={locked}
                        >
                            <Trash/>
                        </Button>
                    </ListGroup.Item>
                )}

                {admin && <ListGroup.Item
                    className={`d-flex ${schoolReportEnabled &&  errorClass(!!errors.schoolReport)}`}
                    onClick={() => changeTab('schoolReport')}>
                    <Form.Check type="checkbox" id="activate-schoolreport" className="mt-2" onChange={() => handleEnabledSchoolReport()} checked={schoolReportEnabled} />
                    <div className={"ms-3 " + (!schoolReportEnabled ? "text-muted" : '')}>
                        Schulnoten
                    </div>
                </ListGroup.Item>}
            </ListGroup>

            {!admin && 
            <Form.Group className={`mb-3`}>
                <Form.Check
                    disabled={locked}
                    type="checkbox"
                    id="dsgvo"
                    label={(<>Ich stimme der<Button className="btn-dsgvo" variant="link" onClick={() => setShowDsgvo(true)}>Datenschutzgrundverordnung</Button>der HTL Saalfelden zu.</>)}
                    {...register(`dsgvo`, { required: "Bitte akzeptieren Sie die Datenschutzbestimmungen"})}/>
                {errors.dsgvo && (
                    <Form.Text className="text-danger">
                        {errors.dsgvo.message}
                    </Form.Text>
                )}	                
            </Form.Group>}

            <Dsgvo show={showDsgvo} onClose={() => setShowDsgvo(false)}/>
            <ContactNew show={showContactNew} onSubmit={handleAddContact} onClose={() => setShowContactNew(false)}/>

            { (!locked || admin) 
                ? 
                <div className="d-flex mt-5">
                    <Button className="me-3" variant="success" type="submit" disabled={!isValid} title="Der Antrag lässt sich erst abschicken, wenn alle Daten vorhanden sind.">Antrag abschicken</Button>
                    <Button className="me-3" variant="outline-warning" onClick={validateForm}>Antrag prüfen</Button>
                    <Button className="me-3" variant="outline-secondary" onClick={onSave}>Daten Speichern</Button>
                    {admin && <Button className="me-3" variant="outline-secondary" onClick={() => navigate('/applicants')}>Zurück</Button>}
                </div>
                :
                <Alert variant="success">Ihr Antrag wurde erfolgreich abgegeben!</Alert>
            }
        </>
    )
}

export { HomeTab }