import { useMemo, useState } from 'react'
import { Row } from 'react-bootstrap'
import { Country } from '../models/country.model'
import { ApiService } from '../services/api.service'
import { ContactTypes } from '../models/contact.model'
import { FormInput } from './form/contact/FormInput'
import { FormSelect } from './form/contact/FormSelect'
import { FormCheck } from './form/contact/FormCheck'
import { ContactProvider } from '../contexts/contact.context'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../models/applicant.model'
import { FormTextArea } from './form/contact/FormTextArea'
import { FormDateInput } from './form/contact/FormDateInput'
import { useTabs } from '../contexts/tabs.context'
import { Title } from '../models/title.model'

interface Props {
    type: ContactTypes
    index: number
    parent?: boolean
    require?: boolean
}

const Contact = (props: Props) => {
    const { type, index, parent, require } = props

    const apiService = useMemo(() => new ApiService(), [])

    // const [type, setType] = useState(props.type)
    // const [parent, setParent] = useState(props.parent)
    // const [index, setIndex] = useState(props.index)
    // const [require, setRequire] = useState(props.require)

    const {
        register
    } = useFormContext<Applicant>()

    const {
        admin
    } = useTabs()

    const getCountries = (inputValue: string) => {
        return apiService.get<Country[]>(Country, undefined, { title: inputValue })
    }

    const getTitles = (inputValue: string) => {
        return apiService.get<Title[]>(Title, undefined, { title: inputValue })
    }    

    return (
        <ContactProvider index={index}>
            {parent ? 
            <>
                <Row>
                    <FormSelect className="col-2" attr="title" title="Anrede" required={require} loadOptions={getTitles}/>
                    <FormInput className="col-2" attr="degree" title="Akad.Grad" />
                    <FormInput className="col-2" attr="sufixDegree" title="Akad. Grad nachg." />
                </Row>

                <Row>
                    <FormInput className="col-3" attr="firstname" title="Vorname" required={require}/>
                    <FormInput className="col-3" attr="moreFirstname" title="Weitere Vornamen"/>
                    <FormInput className="col-3" attr="lastname" title="Nachname" required={require}/>               
                </Row>

                <Row className='mt-3 mb-3'>
                    <FormDateInput className="col-lg-2" attr="birthdate" title="Geburtsdatum" />
                    <FormInput className="col-lg-2" attr="svnr" title="SVN" />
                </Row>
            </> : null}

            <input
                type="hidden"
                {...register(`contacts.${index}.contactTypeKey`)}
                defaultValue={type}
            />

            <Row className='mt-3'>
                <FormInput className="col-lg-3" attr="street" title="Straße" required={require}/>
                <FormInput className="col-lg-1" attr="streetNr" title="Hausnummer" required={require}/>                
            </Row>
            <Row>
                <FormInput className="col-lg-2" attr="zip" title="PLZ" required={require}/>
                <FormInput className="col-lg-3" attr="city" title="Ort" required={require}/> 
                <FormSelect className="col-lg-3" attr="country" title="Land" required={require} loadOptions={getCountries}/>                
            </Row>

            <Row>
                <FormInput className="col-lg-3" attr="phone" title="Telefonnummer" required={require}/>
                <FormInput className="col-lg-3" attr="email" title="Email" required={require} type="email" />                   
            </Row>                      

            { parent &&
                <FormCheck className="col-lg" attr="legalGardian" title="Erziehungsberechtigt"/>
            }

            {parent ?
            <>
                {admin &&
                <>
                    <FormCheck className="col-lg" attr="pupilInBoardingSchool" title="Internat oder Extern"/>
                    <FormCheck className="col-lg" attr="liableToPay" title="Zahlungspflichtig"/>
                    <FormCheck className="col-lg" attr="decitionTo" title="Entscheide an"/>
                    <FormCheck className="col-lg" attr="postTo" title="Post an"/>
                </>}
            </>
            : null}
            <FormCheck className="col-lg" attr="primaryResidenz" title="Hauptwohnsitz"/>

            <FormTextArea className="mt-3 mb-3" attr="annotation" title="Anmerkung" />

        </ContactProvider>
    )
}

export default Contact