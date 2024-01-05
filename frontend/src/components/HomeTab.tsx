import { Button, Form, ListGroup } from "react-bootstrap"
import { Applicant } from "../models/applicant.model"
import { useFormContext } from "react-hook-form"
import { useEffect, useState } from "react"
import "./HomeTab.scss"
import { TabType, useTabs } from "../contexts/tabs.context"
import { toast } from "react-toastify"
import { isContactTab, tabType2ContactType } from "../common/tab.utils"

interface Props {
    onSave: () => void
}

const HomeTab = (props: Props) => {
    const [validated, setValidated] = useState(false)
    const [checkedContactFather, setCheckedContactFather] = useState(false)
    const [checkedContactMother, setCheckedContactMother] = useState(false)
    const [checkedSchoolReport, setCheckedSchoolReport] = useState(false)

    const {
        tabs,
        setTabs,
        setCurrentTab
    } = useTabs()

    const {
        trigger,
        getValues,
        reset,
        formState: { errors, isValid }
    } = useFormContext<Applicant>()

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

    const getContactIndex = (type: TabType) => {
        const applicant = getValues()
        const contactTypes = applicant.contacts?.map(c => c.contactTypeKey)

        return contactTypes!.indexOf(tabType2ContactType(type))
    }

    const errorClass = (hasError: boolean, active = true) => {
        if (validated && active) {
            return hasError ? 'invalid' : 'valid'
        }
    }

    const handleCheckChange = (type: TabType) => {
        setValidated(false)

        let checkState = false
        const currentTabs = [...tabs]


        switch (type) {
            case 'contact-father':
                checkState = !checkedContactFather

                if (!checkState) {
                    if (!checkedContactMother) {
                        const tab = currentTabs.find(t => t.type === 'contact-mother')
                        tab!.active = true
                    }
                }
                break;
            case 'contact-mother':
                checkState = !checkedContactMother

                if (!checkedContactFather) {
                    const tab = currentTabs.find(t => t.type === 'contact-father')
                    tab!.active = true
                }
                break;
            case 'schoolReport':
                checkState = !checkedSchoolReport
                break;
        }

        const tab = currentTabs.find(t => t.type === type)
        tab!.active = checkState

        setTabs(currentTabs)

        if (!checkState) {
            const applicant = getValues()

            if (isContactTab(type)) {
                const index = getContactIndex(type)
                delete applicant.contacts![index]
            }

            if (type === 'schoolReport') {
                delete applicant.schoolReport
            }

            reset(applicant)
        }
    }

    useEffect(() => {
        tabs.forEach(t => {
            switch (t.type) {
                case 'contact-father':
                    setCheckedContactFather(t.active)
                    break;
                case 'contact-mother':
                    setCheckedContactMother(t.active)
                    break;
                case 'schoolReport':
                    setCheckedSchoolReport(t.active)
                    break;
            }
        })
    }, [tabs])

    return (
        <>
            <h3>Liebe Interessentin, lieber Interessent!</h3>
            <p>Sie befinden sich auf der Bewerbungsseite der HTL-Saalfelden...</p>
            <ListGroup>
                <ListGroup.Item variant="secondary"><small>Folgende Daten werden für die Anmeldung benötigt:</small></ListGroup.Item>

                <ListGroup.Item
                    className={errorClass(!!errors.applications)}
                    action
                    onClick={() => changeTab('applications')}
                >
                    Bewerbungen <br /><small>(min. eine Fachrichtung)</small>
                </ListGroup.Item>

                <ListGroup.Item
                    className={errorClass(!!errors.details)}
                    action
                    onClick={() => changeTab('details')}
                >
                    Daten des Bewerbers <br /><small>(vollstandig ausgefüllt)</small>
                </ListGroup.Item>

                <ListGroup.Item
                    className={errorClass(!!errors?.contacts && !!errors.contacts[getContactIndex('contact-applicant')])}
                    action
                    onClick={() => changeTab('contact-applicant')}
                >
                    Kontakt des Bewerbers <br /><small>(vollstandig ausgefüllt)</small>
                </ListGroup.Item>

                <ListGroup.Item variant="secondary"><small>Die weiteren Angaben sind optional. Sie müssen für die Eingabe aktiviert werden.</small></ListGroup.Item>

                <ListGroup.Item
                    className={'d-flex ' + errorClass(!!errors?.contacts && !!errors.contacts[getContactIndex('contact-mother')], checkedContactMother)}
                //action
                //onClick={() => changeTab('contact-mother', checkedContactMother)}
                >
                    <Form.Check type="checkbox" id="activate-contact-mother" onChange={() => handleCheckChange('contact-mother')} checked={checkedContactMother} />
                    <div className={"ms-3 " + (!checkedContactMother ? "text-muted" : '')}>
                        Kontakt der Mutter <br /> <small>(Mindestens ein Elternteil muss angegeben werden)</small>
                    </div>
                </ListGroup.Item>

                <ListGroup.Item
                    className={'d-flex ' + errorClass(!!errors?.contacts && !!errors.contacts[getContactIndex('contact-father')], checkedContactFather)}
                //action={checkedContactFather}
                //onClick={() => changeTab('contact-father', checkedContactFather)}
                >
                    <Form.Check type="checkbox" id="activate-contact-father" className="mt-2" onChange={() => handleCheckChange('contact-father')} checked={checkedContactFather} />
                    <div className={"ms-3 " + (!checkedContactFather ? "text-muted" : '')}>
                        Kontakt des Vaters
                    </div>
                </ListGroup.Item>

                <ListGroup.Item
                    className={'d-flex ' + errorClass(!!errors.schoolReport, checkedSchoolReport)}
                //action
                //onClick={() => changeTab('schoolReport', checkedSchoolReport)}
                >
                    <Form.Check type="checkbox" id="activate-schoolreport" className="mt-2" onChange={() => handleCheckChange('schoolReport')} checked={checkedSchoolReport} />
                    <div className={"ms-3 " + (!checkedSchoolReport ? "text-muted" : '')}>
                        Schulnoten <br /><small>(falls vorhanden)</small>
                    </div>
                </ListGroup.Item>
            </ListGroup>

            <div className="d-flex mt-5">
                <Button className="me-3" variant="success" type="submit" disabled={!isValid}>Antrag abschicken</Button>
                <Button className="me-3" variant="outline-warning" onClick={validateForm}>Antrag prüfen</Button>
                <Button className="me-3" variant="outline-secondary" onClick={props.onSave}>Daten Speichern</Button>
            </div>
        </>
    )
}

export { HomeTab }