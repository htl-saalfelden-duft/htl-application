import React, { useMemo } from 'react'
import { Form, Row } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import { Applicant } from '../models/applicant.model'
import { SchoolReportGroups } from '../models/schoolReport.model'
import { ApiService } from '../services/api.service'
import AsyncSelect from 'react-select/async'

const SchoolReport = () => {
    const apiService = useMemo(() => new ApiService(), [])

    const {
        register,
        control,
        formState: { errors }
    } = useFormContext<Applicant>()

    const getSchoolReportGroups = (inputValue: string) => {
		return apiService.get<SchoolReportGroups[]>(SchoolReportGroups, undefined, { title: inputValue })
	}

    return (
        <>
            <Row>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="gerGrade">
                        Note Deutsch
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.gerGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="gerGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.gerGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.gerGrade.message}
                        </Form.Text>
                    )}
                </Form.Group>

                <Form.Group className="mb-3 col-lg-2">
                    <Form.Label htmlFor="gerGroup">
                        Gruppe <br/>Deutsch
                    </Form.Label>
                    <Controller
                        control={control}
                        name="schoolReport.gerGroup"
                        rules={{
                            required: "Bitte Gruppe eingeben"
                        }}
                        render={({ field }) => (
                            <AsyncSelect
                                ref={field.ref}
                                loadOptions={getSchoolReportGroups}
                                defaultOptions
                                value={{title: field.value}}
                                onChange={val => field.onChange(val?.title)}
                                getOptionLabel={option => option.title as string}
                                inputId="gerGroup"
                            />
                        )}
                    />                            
                    {errors.schoolReport?.gerGroup && (
                        <Form.Text className="text-danger">
                        {errors.schoolReport?.gerGroup.message}
                        </Form.Text>
                    )}
                </Form.Group>
            </Row>

            <Row>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="engGrade">
                        Note Englisch
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.engGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="engGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.engGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.engGrade!.message}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group className="mb-3 col-lg-2">
                    <Form.Label htmlFor="engGroup">
                        Gruppe <br/>Englisch
                    </Form.Label>
                    <Controller
                        control={control}
                        name="schoolReport.engGroup"
                        rules={{
                            required: "Bitte Gruppe eingeben"
                        }}
                        render={({ field }) => (
                            <AsyncSelect
                                ref={field.ref}
                                loadOptions={getSchoolReportGroups}
                                defaultOptions
                                value={{title: field.value}}
                                onChange={val => field.onChange(val?.title)}
                                getOptionLabel={option => option.title as string}
                                inputId="engGroup"
                            />
                        )}
                    />                            
                    {errors.schoolReport?.engGroup && (
                        <Form.Text className="text-danger">
                        {errors.schoolReport?.engGroup.message}
                        </Form.Text>
                    )}
                </Form.Group>             
            </Row>

            <Row>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="mathGrade">
                        Note Mathematik
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.mathGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="mathGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.mathGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.mathGrade!.message}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group className="mb-3 col-lg-2">
                    <Form.Label htmlFor="mathGroup">
                        Gruppe <br/>Mathematik
                    </Form.Label>
                    <Controller
                        control={control}
                        name="schoolReport.mathGroup"
                        rules={{
                            required: "Bitte Gruppe eingeben"
                        }}
                        render={({ field }) => (
                            <AsyncSelect
                                ref={field.ref}
                                loadOptions={getSchoolReportGroups}
                                defaultOptions
                                value={{title: field.value}}
                                onChange={val => field.onChange(val?.title)}
                                getOptionLabel={option => option.title as string}
                                inputId="mathGroup"
                            />
                        )}
                    />                            
                    {errors.schoolReport?.mathGroup && (
                        <Form.Text className="text-danger">
                        {errors.schoolReport?.mathGroup.message}
                        </Form.Text>
                    )}
                </Form.Group>           
            </Row>
            <Row>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="historyGrade">
                        Note Geschichte
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.historyGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="historyGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.historyGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.historyGrade!.message}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="geographyGrade">
                        Note Geografie
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.geographyGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="geographyGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.geographyGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.geographyGrade!.message}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="chemistryGrade">
                        Note Chemie
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.chemistryGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="chemistryGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.chemistryGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.chemistryGrade!.message}
                        </Form.Text>
                    )}
                </Form.Group>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="physicsGrade">
                        Note Physik
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.physicsGrade", {valueAsNumber: true, required: "Bitte Note eingeben"})}
                        id="physicsGrade"
                        min={1}
                        max={5}
                    />
                    {errors.schoolReport?.physicsGrade && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.physicsGrade.message}
                        </Form.Text>
                    )}
                </Form.Group>
            </Row>                
        </>
    )
}

export default SchoolReport