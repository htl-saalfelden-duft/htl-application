import { Alert, Form, Row } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import { ApiService } from "../services/api.service"
import { Country } from "../models/country.model"
import { Language } from "../models/language.model"
import { Sex } from "../models/sex.model"
import { Religion } from "../models/religion.model"
import { Applicant } from "../models/applicant.model"
import DatePicker from "react-datepicker";
import { useMemo } from "react"
import { FormInput } from "./form/details/FormInput"
import { FormSelect } from "./form/details/FormSelect"
import { ExclamationCircle, Lightbulb } from "react-bootstrap-icons"
import { FormDateInput } from "./form/details/FormDateInput"

const ApplicantDetails = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const {
        register
    } = useFormContext<Applicant>()  

    const getCountries = (inputValue: string) => {
        const apiService = new ApiService()

        return apiService.get<Country[]>(Country, undefined, { title: inputValue })
    }

    const getLanguage = (inputValue: string) => {
        return apiService.get<Language[]>(Language, undefined, { title: inputValue })
    }

    const getSex = (inputValue: string) => {
        return apiService.get<Sex[]>(Sex, undefined, { title: inputValue })
    }

    const getReligion = (inputValue: string) => {
        return apiService.get<Religion[]>(Religion, undefined, { title: inputValue })
    }

    return (
            <>
                <h5 className="mb-4">Bitte geben Sie Daten des/der Bewerbers/in ein:</h5>
                <Row className="mb-3">
                    <FormInput attr="firstname" title="Vorname" className="col-lg" required={true} />
                    <FormInput attr="moreFirstname" title="Weitere Vornamen" className="col-lg"/>
                    <FormInput attr="lastname" title="Nachname" className="col-lg" required={true}/>                  
                </Row>

                <Row className="mb-3">
                    <FormDateInput attr="birthdate" title="Geburtsdatum" className="col-lg" required={true}/>
                    <FormInput attr="svnr" title="SVN" className="col-lg" required={true} />
                    <FormInput attr="svInstitution" title="Sozialversicherungs-Anstalt" className="col-lg" required={true} />                                                             
                </Row>
                <Row>
                    <FormSelect className="col-lg-3" attr="countryOfBirth" title="Geburtsland" required={true} loadOptions={getCountries}/> 
                    <FormInput attr="placeOfBirth" title="Geburtsort" className="col-lg-3" required={true} />  
                </Row>

                <Row>
                    <FormSelect className="col-lg-3" attr="nationality" title="Nationalität" required={true} loadOptions={getCountries}/> 
                    <FormSelect className="col-lg-3" attr="language" title="Muttersprache" required={true} loadOptions={getLanguage}/>
                </Row>

                <Row className="mb-3">
                    <FormSelect className="col-lg-3" attr="sex" title="Geschlecht" required={true} loadOptions={getSex}/>
                    <FormSelect className="col-lg-3" attr="religion" title="Religion" required={true} loadOptions={getReligion}/>                     
                </Row>
 
                <Row>
                    <FormInput attr="previousSchoolTxt" title="zuletzt besuchte Schule(Schulbezeichnung)" className="col-lg-4" required={true} />  
                    <FormInput attr="previousSchoolNum" title="zuletzt besuchte Schule(Schulkennzahl)" className="col-lg-3" required={true} />
                    <FormInput attr="previousSchoolAddress" title="zuletzt besuchte Schule(Anschrift)" className="col-lg-4" required={true} />
                </Row>
                <Alert variant="info" className="mb-3">
                <Lightbulb size={32} className="me-2"/> Die genaue Bezeichnung, sowie die Schulkennzahl und Adresse finden sie auf <a href="https://www.schulen-online.at/">https://www.schulen-online.at/</a> unter Schulsuche.
                </Alert>
                <Form.Group className="mb-3 col-lg">
                    <Form.Check
                        type="checkbox"
                        id="schoolAge"
                        label="Schulpflichtig"
                        {...register("details.schoolAge")}
                    />
                </Form.Group>

                <Form.Group className="mb-3 col-lg">
                    <Form.Check
                        type="checkbox"
                        id="boardingSchool"
                        label="Heimschüler"
                        {...register("details.boardingSchool")}
                    />
                </Form.Group>                                                
                <Alert variant="warning" className="mb-3">
                    <ExclamationCircle size={32} className="me-2"/> Es erfolgt keine Anmeldung am Schülerheim. Diese hat getrennt zu erfolgen. Informationen erhalten sie unter <a href="https://studentenheim.at/ ">https://studentenheim.at/</a>
                </Alert>
                
                <Form.Group className="mt-3 mb-3">
                    <Form.Label htmlFor="annotation">Anmerkung</Form.Label>
                    <Form.Control 
                        as="textarea"
                        rows={3}
                        {...register("details.annotation")}
                        id="annotation"
                    />
                </Form.Group>
            </>
    )
}

export default ApplicantDetails