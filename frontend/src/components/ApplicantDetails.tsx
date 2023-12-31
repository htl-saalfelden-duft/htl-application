import { Form, Row } from "react-bootstrap"
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
import { ErrorMessege } from "./form/details/ErrorMessage"
import { FormSelect } from "./form/details/FormSelect"

const ApplicantDetails = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const {
        register,
        control,
        formState: { errors }
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
                <Row className="mb-3">
                    <FormInput attr="firstname" title="Vorname" className="col-lg" required={true} />
                    <FormInput attr="moreFirstname" title="Weitere Vornamen" className="col-lg"/>
                    <FormInput attr="lastname" title="Nachname" className="col-lg" required={true}/>                  
                </Row>

                <Row className="mb-3">
                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="birthdate">
                            Geburtsdatum*
                        </Form.Label>
                        <Controller
                            control={control}
                            name='details.birthdate'
                            rules={{
                                required: "Bitte Geburtsdatum eingeben",
                            }}
                            render={({ field }) => (
                                <DatePicker
                                    wrapperClassName="input-group"
                                    className="form-control"
                                    placeholderText='Select date'
                                    onChange={(value) => field.onChange(value)}
                                    id="birthdate"
                                    dateFormat="dd.MM.yyy"
                                    selected={field.value ? new Date(field.value) : undefined}
                                />
                            )} 
                        />              
                        <ErrorMessege errors={errors} attr="birthdate" />
                    </Form.Group>

                    <FormInput attr="svnr" title="SVN" className="col-lg" required={true} />
                    <FormInput attr="svInstitution" title="Sozialversicherungs-Anstalt" className="col-lg" required={true} />                                                             
                </Row>
                <Row>
                    <FormSelect className="col-lg-3" attr="countryOfBirth" title="Geburtsland" required={true} loadOptions={getCountries}/> 
                    <FormInput attr="placeOfBirth" title="Geburtsort" className="col-lg-3" required={true} />  
                </Row>

                <Row>
                    <FormSelect className="col-lg-3" attr="nationality" title="Nationalität" required={true} loadOptions={getCountries}/> 
                    <FormSelect className="col-lg-3" attr="language" title="Sprache" required={true} loadOptions={getLanguage}/>
                </Row>

                <Row className="mb-3">
                    <FormSelect className="col-lg-3" attr="sex" title="Geschlecht" required={true} loadOptions={getSex}/>
                    <FormSelect className="col-lg-3" attr="religion" title="Religion" required={true} loadOptions={getReligion}/>                     
                </Row>
 
                <Row>
                    <FormInput attr="previousSchoolTxt" title="Vorschule(Text)" className="col-lg-4" required={true} />  
                    <FormInput attr="previousSchoolNum" title="Vorschule(Zahl)" className="col-lg-3" required={true} />
                    <FormInput attr="previousSchoolAddress" title="Vorschule(Anschrift)" className="col-lg-4" required={true} />
                </Row>

                <FormInput attr="secondChoiceSchool" title="Zweitwunschschule" className="col-lg-4" required={true} />                                                                                                

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