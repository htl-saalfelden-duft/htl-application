import React, { useMemo } from 'react'
import { Row } from 'react-bootstrap'
import { SchoolReportGroups } from '../models/schoolReport.model'
import { ApiService } from '../services/api.service'
import { FormGrade } from './form/schoolReport/FormGrade'
import { FormGroup } from './form/schoolReport/FormGroup'

const SchoolReport = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const getSchoolReportGroups = (inputValue: string) => {
		return apiService.get<SchoolReportGroups[]>(SchoolReportGroups, undefined, { title: inputValue })
	}

    return (
        <>
            <Row>
                <FormGrade className='col-1' attr='gerGrade' title='Note Deutsch' required={true} />
                <FormGroup className='col-lg-2' attr='gerGroup' title="Deutsch" loadOptions={getSchoolReportGroups} required={true} />
            </Row>

            <Row>
                <FormGrade className='col-1' attr='engGrade' title='Note Englisch' required={true} />
                <FormGroup className='col-lg-2' attr='engGroup' title="Englisch" loadOptions={getSchoolReportGroups} required={true} />           
            </Row>

            <Row>
                <FormGrade className='col-1' attr='mathGrade' title='Note Mathematik' required={true} />
                <FormGroup className='col-lg-2' attr='mathGroup' title="Mathematik" loadOptions={getSchoolReportGroups} required={true} />           
            </Row>
            <Row>
                <FormGrade className='col-1' attr='historyGrade' title='Note Geschichte' required={true} />
                <FormGrade className='col-1' attr='geographyGrade' title='Note Geografie' required={true} />
                <FormGrade className='col-1' attr='chemistryGrade' title='Note Chemie' required={true} />
                <FormGrade className='col-1' attr='physicsGrade' title='Note Physik' required={true} />
                <FormGrade className='col-1' attr='biologieGrade' title='Note Biologie' required={true} />
            </Row>                
        </>
    )
}

export default SchoolReport