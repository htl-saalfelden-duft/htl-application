import { useMemo } from "react"
import { ApiService } from "../services/api.service"

import { Button, Table } from "react-bootstrap"
import { ArrowDown, ArrowUp, Plus, Trash } from "react-bootstrap-icons"
import { SchoolClass } from "../models/schoolClass.model"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { Applicant } from "../models/applicant.model"
import AsyncSelect from 'react-select/async'
import './Applications.scss'

interface Props {
}

const Applications = (props: Props) => {
	const apiService = useMemo(() => new ApiService(), [])

	const {
		control,
		formState: { errors },
		setValue,
	} = useFormContext<Applicant>()

	const { fields, append, remove, swap } = useFieldArray({
		control,
		name: "applications"
	});

	const getSchoolClasses = (inputValue: string) => {
		return apiService.get<SchoolClass[]>(SchoolClass, undefined, { title: inputValue })
	}

	const onMove = (from: number, to: number) => {

		setValue(`applications.${from}.priority`, to + 1)
		setValue(`applications.${to}.priority`, from + 1)

		swap(from, to)
	}

	const hasError = (index: number) => !!(errors.applications && errors.applications[index] && errors.applications[index]!.schoolClass)


	return (
		<>
			<Button
				variant="outline-secondary"
				className="mb-2"
				onClick={() => append({ priority: fields.length + 1, schoolClassID: "" })}>
				<Plus />
			</Button>
			<Table striped bordered hover className="application-table">
				<thead>
					<tr>
						<th className="col-prio">Priorität</th>
						<th>Ausbildungsrichtung</th>
						<th className="col-action"></th>
					</tr>
				</thead>
				<tbody>
					{fields.map((item, index) => (
						<tr key={item.id}>
							<td>{item.priority}</td>
							<td>
								<Controller
									control={control}
									name={`applications.${index}.schoolClass`}
									rules={{
										required: "Bitte Fachrichtung angeben"
									}}
									render={({ field }) => (
										<AsyncSelect
											ref={field.ref}
											loadOptions={getSchoolClasses}
											defaultOptions
											value={field.value}
											onChange={val => field.onChange(val)}
											getOptionLabel={option => option.title as string}
											inputId={`applications.${index}.schoolClass`}
											classNames={{
												control: (state) => hasError(index) ? 'form-control is-invalid' : 'form-control',
											  }}
										/>
									)}
								/>
							</td>
							<td>
								<Button variant="outline-danger" className="me-2" onClick={() => remove(index)}><Trash /></Button>
								{index > 0 ? <Button variant="outline-primary" className="me-2" onClick={() => onMove(index, index - 1)}><ArrowUp /></Button> : null}
								{index < fields.length - 1 ? <Button variant="outline-primary" className="me-2" onClick={() => onMove(index, index + 1)}><ArrowDown /></Button> : null}
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	)
}

export { Applications }