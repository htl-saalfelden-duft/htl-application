import { Form, Row } from "react-bootstrap"
import { Controller, useFormContext } from "react-hook-form"
import AsyncSelect from 'react-select/async'
import { ApiService } from "../services/api.service"
import { Country } from "../models/country.model"
import { Language } from "../models/language.model"
import { Sex } from "../models/sex.model"
import { Religion } from "../models/religion.model"
import { Applicant } from "../models/applicant.model"
import DatePicker from "react-datepicker";
import { useMemo } from "react"

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
                    <Form.Group className="mb-3 col">
                        <Form.Label htmlFor="firstname">
                            Vorname*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.firstname", { required: "Bitte Vorname eingeben" })}
                            id="firstname"
                        />
                        {errors.details?.firstname && (
                            <Form.Text className="text-danger">
                                {errors.details?.firstname.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col">
                        <Form.Label htmlFor="moreFirstname">
                        Weitere Vornamen
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.moreFirstname")}
                            id="moreFirstname"
                        />
                        {errors.details?.moreFirstname && (
                            <Form.Text className="text-danger">
                            {errors.details?.moreFirstname.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="lastname">
                            Nachname*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.lastname", { required: "Bitte Nachname eingeben" })}
                            id="lastname"
                        />
                        {errors.details?.lastname && (
                            <Form.Text className="text-danger">
                            {errors.details?.lastname.message}
                            </Form.Text>
                        )}
                    </Form.Group>                    
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
                                maxLength: 20
                            }}
                            render={({ field }) => (
                            <DatePicker
                                wrapperClassName="input-group"
                                className="form-control"
                                placeholderText='Select date'
                                onChange={(value) => {
                                    console.log(value)
                                    return field.onChange(value)
                                }}
                                id="birthdate"
                                dateFormat="dd.MM.yyy"
                                selected={field.value ? new Date(field.value) : undefined}
                            />
                        )} />                
                        {errors.details?.birthdate && (
                            <Form.Text className="text-danger">
                            {errors.details?.birthdate.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="svnr">
                            SVN*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.svnr", { required: "Bitte SVN eingeben" })}
                            id="svnr"
                        />
                        {errors.details?.svnr && (
                            <Form.Text className="text-danger">
                            {errors.details?.svnr.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="svInstitution">
                            Sozialversicherungs-Anstalt*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.svInstitution", { required: "Bitte Sozialversicherungs-Anstalt eingeben" })}
                            id="svInstitution"
                        />
                        {errors.details?.svInstitution && (
                            <Form.Text className="text-danger">
                            {errors.details?.svInstitution.message}
                            </Form.Text>
                        )}
                    </Form.Group>                                                                
                </Row>
                <Row>
                    <Form.Group className="mb-3 col-lg-3">
                        <Form.Label htmlFor="countryOfBirth">
                            Geburtsland*
                        </Form.Label>
                        <Controller
                            control={control}
                            name="details.countryOfBirth"
                            rules={{
                                required: "Bitte Geburtsland eingeben",
                                maxLength: 20
                            }}
                            render={({ field }) => (
                                <AsyncSelect
                                    ref={field.ref}
                                    loadOptions={getCountries}
                                    defaultOptions
                                    value={{title: field.value}}
                                    onChange={val => field.onChange(val?.title)}
                                    getOptionLabel={option => option.title}
                                    inputId="countryOfBirth"
                                />
                            )}
                        />                            
                        {errors.details?.countryOfBirth && (
                            <Form.Text className="text-danger">
                            {errors.details?.countryOfBirth.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg-3">
                        <Form.Label htmlFor="placeOfBirth">
                            Geburtsort*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.placeOfBirth", { required: "Bitte Geburtsort eingeben" })}
                            id="placeOfBirth"
                        />
                        {errors.details?.placeOfBirth && (
                            <Form.Text className="text-danger">
                            {errors.details?.placeOfBirth.message}
                            </Form.Text>
                        )}
                    </Form.Group>
                </Row>

                <Row>
                    <Form.Group className="mb-3 col-lg-3">
                        <Form.Label htmlFor="nationality">
                            Nationalität*
                        </Form.Label>
                        <Controller
                            control={control}
                            name="details.nationality"
                            rules={{
                                required: "Bitte Nationalität eingeben"
                            }}
                            render={({ field }) => (
                                <AsyncSelect
                                    ref={field.ref}
                                    loadOptions={getCountries}
                                    defaultOptions
                                    value={{title: field.value}}
                                    onChange={val => field.onChange(val?.title)}
                                    getOptionLabel={option => option.title}
                                    inputId="nationality"
                                />
                            )}
                        />                            
                        {errors.details?.nationality && (
                            <Form.Text className="text-danger">
                            {errors.details?.nationality.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg-3">
                        <Form.Label htmlFor="language">
                            Sprache*
                        </Form.Label>
                        <Controller
                            control={control}
                            name="details.language"
                            rules={{
                                required: "Bitte Sprache eingeben"
                            }}
                            render={({ field }) => (
                                <AsyncSelect
                                    ref={field.ref}
                                    loadOptions={getLanguage}
                                    defaultOptions
                                    value={{title: field.value}}
                                    onChange={val => field.onChange(val?.title)}
                                    getOptionLabel={option => option.title}
                                    inputId="language"
                                />
                            )}
                        />                            
                        {errors.details?.language && (
                            <Form.Text className="text-danger">
                            {errors.details?.language.message}
                            </Form.Text>
                        )}
                    </Form.Group>  
                </Row>

                <Row className="mb-3">
                    <Form.Group className="mb-3 col-lg-3">
                        <Form.Label htmlFor="sex">
                            Geschlecht*
                        </Form.Label>
                        <Controller
                            control={control}
                            name="details.sex"
                            rules={{
                                required: "Bitte Geschlecht eingeben"
                            }}
                            render={({ field }) => (
                                <AsyncSelect
                                    ref={field.ref}
                                    loadOptions={getSex}
                                    defaultOptions
                                    value={{title: field.value}}
                                    onChange={val => field.onChange(val?.title)}
                                    getOptionLabel={option => option.title}
                                    inputId="sex"
                                />
                            )}
                        />                            
                        {errors.details?.sex && (
                            <Form.Text className="text-danger">
                            {errors.details?.sex.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg-3">
                        <Form.Label htmlFor="religion">
                            Religion*
                        </Form.Label>
                        <Controller
                            control={control}
                            name="details.religion"
                            rules={{
                                required: "Bitte Religion eingeben"
                            }}
                            render={({ field }) => (
                                <AsyncSelect
                                    ref={field.ref}
                                    loadOptions={getReligion}
                                    defaultOptions
                                    value={{title: field.value}}
                                    onChange={val => field.onChange(val?.title)}
                                    getOptionLabel={option => option.title}
                                    inputId="religion"
                                />
                            )}
                        />                            
                        {errors.details?.religion && (
                            <Form.Text className="text-danger">
                            {errors.details?.religion.message}
                            </Form.Text>
                        )}
                    </Form.Group>                        
                </Row>
 
                <Row>
                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="previousSchoolTxt">
                            Vorschule(Text)*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.previousSchoolTxt", { required: "Bitte Vorschule(Text) eingeben" })}
                            id="previousSchoolTxt"
                        />
                        {errors.details?.previousSchoolTxt && (
                            <Form.Text className="text-danger">
                            {errors.details?.previousSchoolTxt.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="previousSchoolNum">
                        Vorschule(Zahl)
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.previousSchoolNum", { required: "Bitte Vorschule(Zahl) eingeben" })}
                            id="previousSchoolNum"
                        />
                        {errors.details?.previousSchoolNum && (
                            <Form.Text className="text-danger">
                            {errors.details?.previousSchoolNum.message}
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 col-lg">
                        <Form.Label htmlFor="previousSchoolAddress">
                            Vorschule(Anschrift)*
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("details.previousSchoolAddress", { required: "Bitte Vorschule(Anschrift) eingeben" })}
                            id="previousSchoolAddress"
                        />
                        {errors.details?.previousSchoolAddress && (
                            <Form.Text className="text-danger">
                            {errors.details?.previousSchoolAddress.message}
                            </Form.Text>
                        )}
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3 col-lg-3">
                    <Form.Label htmlFor="secondChoiceSchool">
                        Zweitwunschschule
                    </Form.Label>
                    <Form.Control
                        type="text"
                        {...register("details.secondChoiceSchool")}
                        id="secondChoiceSchool"
                    />
                </Form.Group>                                                                                               

                <Row className="mt-3">
                    <Form.Group className="mb-3 col-lg">
                        <Form.Check
                            type="checkbox"
                            id="schoolAge"
                            label="Schulpflichtig"
                            {...register("details.schoolAge")}
                        />
                    </Form.Group>
                    {/* <Form.Group className="mb-3 col-lg">
                        <Form.Check
                            type="checkbox"
                            id="schoolHome"
                            label="Heimschüler"
                            {...register("details.schoolHome")}
                        />
                    </Form.Group>                                                 */}
                </Row>

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