import React from 'react'
import { Form, Row } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../models/applicant.model'


const SchoolReport = () => {

    const {
        register,
        control,
        formState: { errors }
    } = useFormContext<Applicant>()

    return (
        <>
            <Row>
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="gerGrade">
                        Note Deutsch
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.gerGrade", {valueAsNumber: true})}
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
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="gerGroup">
                        Gruppe Deutsch
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.gerGroup", {valueAsNumber: true})}
                        id="gerGroup"
                        min={1}
                        max={3}
                    />
                    {errors.schoolReport?.gerGroup && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.gerGroup!.message}
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
                        {...register("schoolReport.engGrade", {valueAsNumber: true})}
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
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="engGroup">
                        Gruppe Englisch
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.engGroup", {valueAsNumber: true})}
                        id="engGroup"
                        min={1}
                        max={3}
                    />
                    {errors.schoolReport?.engGroup && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.engGroup!.message}
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
                        {...register("schoolReport.mathGrade", {valueAsNumber: true})}
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
                <Form.Group className="mb-3 col-1">
                    <Form.Label htmlFor="mathGroup">
                        Gruppe Mathematik
                    </Form.Label>
                    <Form.Control
                        type="number"
                        {...register("schoolReport.mathGroup", {valueAsNumber: true})}
                        id="mathGroup"
                        min={1}
                        max={3}
                    />
                    {errors.schoolReport?.mathGroup && (
                        <Form.Text className="text-danger">
                            {errors.schoolReport?.mathGroup!.message}
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
                        {...register("schoolReport.historyGrade", {valueAsNumber: true})}
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
                        {...register("schoolReport.geographyGrade", {valueAsNumber: true})}
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
                        {...register("schoolReport.chemistryGrade", {valueAsNumber: true})}
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
                        {...register("schoolReport.physicsGrade", {valueAsNumber: true})}
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