import { useMemo } from "react"
import { ApiService } from "../services/api.service"
import { Alert, Button, Form, Table } from "react-bootstrap"
import { ArrowDown, ArrowUp, ExclamationCircle, PlusLg, Trash } from "react-bootstrap-icons"
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
		register,
	} = useFormContext<Applicant>()

	const { fields, append, remove, swap } = useFieldArray({
		control,
		name: "applications"
	});

	const getSchoolClasses = (inputValue: string) => {
		return apiService.get<SchoolClass[]>(SchoolClass, undefined, { title: inputValue })
	}

	const onMove = (from: number, to: number) => {
		swap(from, to)
	}

	const onRemove = (index: number) => {
		remove(index)
	}

	const hasError = (index: number) => !!(errors.applications && errors.applications[index] && errors.applications[index]!.schoolClass)

	return (
		<>
			<h5 className="mb-4">Bitte geben Sie jede Fachrichtung an, für die Interesse besteht.</h5>
			<Button
				variant="outline-secondary"
				className="mb-2"
				onClick={() => append({ priority: fields.length + 1, schoolClassID: "", statusKey: "created" })}>
				<PlusLg/>
			</Button>
			<Table hover className="application-table">
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
							<td>{index+1}</td>
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
								{errors.applications &&
									errors.applications[index] &&
									errors.applications[index]!.schoolClass && (
										<Form.Text className="text-danger">
											{errors.applications![index]!.schoolClass?.message}
										</Form.Text>
									)}
							</td>
							<td>
								{ fields.length > 1 ? <Button variant="outline-danger" className="me-2" onClick={() => onRemove(index)}><Trash /></Button> : null}
								{index > 0 ? <Button variant="outline-primary" className="me-2" onClick={() => onMove(index, index - 1)}><ArrowUp /></Button> : null}
								{index < fields.length - 1 ? <Button variant="outline-primary" className="me-2" onClick={() => onMove(index, index + 1)}><ArrowDown /></Button> : null}
							</td>
						</tr>
					))}
				</tbody>
			</Table>

			<Alert variant="warning" className="mb-3">
                <ExclamationCircle size={32} className="me-2"/>Bitte entfernen Sie die nicht benötigten Felder!
            </Alert>

			<Form.Group className="mb-3">
				<Form.Label htmlFor="details.secondChoiceSchool">Zweitwunschschule</Form.Label>
				<Form.Control
					type="text"
					{...register("details.secondChoiceSchool")}
					id="details.secondChoiceSchool"
				/>
			</Form.Group>
			<Alert variant="warning" className="mb-3">
				<ExclamationCircle size={32} className="me-2"/> Sie melden sich nur an der HTL Saalfelden an. Ihr Interesse an der Zweitwunschschule wird zwar registriert, es erfolgt aber keine Anmeldung in der 1. Anmelderunde.
			</Alert>
		</>
	)
}

export { Applications }