import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Modal } from 'react-bootstrap';
import { useMemo } from 'react';
import { ApiService } from '../../services/api.service';
import AsyncSelect from 'react-select/async';
import { ApplicantStatus } from '../../models/applicant.model';
import { SchoolClass } from '../../models/schoolClass.model';

interface Props {
	show: boolean
	filter?: ApplicantsFilterFormInput
	onFilter: (data: ApplicantsFilterFormInput) => void
	onClose: () => void
}

export interface ApplicantsFilterFormInput {
	applicantStatus?: ApplicantStatus
	schoolClass?: SchoolClass
	search: string
}

const ApplicantsFilter = (props: Props) => {
	const { show, filter, onClose, onFilter } = props

	const apiService = useMemo(() => new ApiService(), [])

	const {
		handleSubmit,
		register,
		control,
		reset,
		formState: { errors }
	} = useForm<ApplicantsFilterFormInput>()

	const onFormSubmit = handleSubmit((data) => {
		onFilter(data)
	})

	const handleShow = () => {
		reset(filter)
	}

	const handleClear = () => {
		reset({
			applicantStatus: {},
			schoolClass: {}, 
			search: ''
		})
		onFilter({} as ApplicantsFilterFormInput)
	}

	const getApplicantStatus = (inputValue: string) => {
		return apiService.get<ApplicantStatus[]>(ApplicantStatus, undefined, { title: inputValue })
	}

	const getSchoolClasses = (inputValue: string) => {
		return apiService.get<SchoolClass[]>(SchoolClass, undefined, { title: inputValue })
	}

	return (
		<Modal show={show} onShow={handleShow} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Bewerber filtern</Modal.Title>
			</Modal.Header>
			<Form onSubmit={onFormSubmit} autoComplete='off'>
				<Modal.Body>
					<Form.Group>
						<Form.Label htmlFor="search">Suche</Form.Label>
						<Form.Control
							type="text"
							{...register("search")}
							id="search"
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label htmlFor="applicantStatus">
							Bewerber-Status
						</Form.Label>
						<Controller
							control={control}
							name="applicantStatus"
							render={({ field }) => (
								<AsyncSelect
									ref={field.ref}
									loadOptions={getApplicantStatus}
									defaultOptions
									value={field.value}
									onChange={obj => field.onChange(obj)}
									getOptionLabel={option => option.title}
									getOptionValue={option => option.title}
									inputId="applicantStatus"
								/>
							)}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label htmlFor="schoolClass">
							Fachrichtung
						</Form.Label>
						<Controller
							control={control}
							name="schoolClass"
							render={({ field }) => (
								<AsyncSelect
									ref={field.ref}
									loadOptions={getSchoolClasses}
									defaultOptions
									value={field.value}
									onChange={obj => field.onChange(obj)}
									getOptionLabel={option => option.title}
									getOptionValue={option => option.title}
									inputId="schoolClass"
								/>
							)}
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={handleClear}>
						Zurücksetzen
					</Button>
					<Button variant="outline-primary" type='submit'>
						Filter setzen
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	)
}

export default ApplicantsFilter
