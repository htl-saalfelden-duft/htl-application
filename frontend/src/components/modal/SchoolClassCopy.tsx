import { Alert, Button, Form, Modal, Table } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiService } from '../../services/api.service';
import { nextSchoolYear, SchoolClass, SchoolClassCopyResult } from '../../models/schoolClass.model';

interface Props {
	show: boolean
	schoolClasses: SchoolClass[]
	onClose: () => void
	onSaved: () => void
}

// Takes the school classes of a previous school year over into a new one
const SchoolClassCopy = (props: Props) => {
	const { show, schoolClasses, onClose, onSaved } = props

	const apiService = useMemo(() => new ApiService(), [])

	const years = useMemo(() => Array.from(new Set(schoolClasses.map(sc => sc.year))).sort().reverse(), [schoolClasses])

	const [sourceYear, setSourceYear] = useState('')
	const [targetYear, setTargetYear] = useState('')
	const [selectedIDs, setSelectedIDs] = useState<string[]>([])
	const [deactivateSource, setDeactivateSource] = useState(true)
	const [saving, setSaving] = useState(false)

	const sources = schoolClasses.filter(sc => sc.year === sourceYear)
	const targetTitles = new Set(schoolClasses.filter(sc => sc.year === targetYear).map(sc => sc.title))
	const targetYearValid = /^\d{2}\/\d{2}$/.test(targetYear) && targetYear !== sourceYear

	const selectSourceYear = (year: string) => {
		setSourceYear(year)
		setTargetYear(nextSchoolYear(year))
		setSelectedIDs(schoolClasses.filter(sc => sc.year === year).map(sc => sc.id))
	}

	const handleShow = () => {
		selectSourceYear(years[0] ?? '')
		setDeactivateSource(true)
	}

	const toggle = (id: string, checked: boolean) => {
		setSelectedIDs(ids => checked ? [...ids, id] : ids.filter(selected => selected !== id))
	}

	const submit = () => {
		setSaving(true)
		apiService.post<SchoolClassCopyResult>(SchoolClass, 'copy', { ids: selectedIDs, targetYear, deactivateSource })
			.then(result => {
				let message = `${result.created} Fachrichtung(en) ins Schuljahr ${targetYear} übernommen.`
				if (result.skipped) message += ` ${result.skipped} bereits vorhanden.`
				if (result.deactivated) message += ` ${result.deactivated} aus ${sourceYear} deaktiviert.`
				toast(message, { type: 'success' })
				onSaved()
			}, (err) => toast(err.response.data.message, { type: 'error' }))
			.finally(() => setSaving(false))
	}

	return (
		<Modal show={show} onShow={handleShow} onHide={onClose} size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Fachrichtungen übernehmen</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="row">
					<Form.Group className="mb-3 col-md-6">
						<Form.Label htmlFor="sourceYear">Aus Schuljahr</Form.Label>
						<Form.Select id="sourceYear" value={sourceYear} onChange={e => selectSourceYear(e.target.value)}>
							{years.map(year => <option key={year} value={year}>{year}</option>)}
						</Form.Select>
					</Form.Group>
					<Form.Group className="mb-3 col-md-6">
						<Form.Label htmlFor="targetYear">In Schuljahr</Form.Label>
						<Form.Control id="targetYear" value={targetYear} onChange={e => setTargetYear(e.target.value)} placeholder="25/26" isInvalid={!!targetYear && !targetYearValid} />
						{!!targetYear && !targetYearValid && <Form.Text className="text-danger">Format: 25/26, abweichend vom Quell-Schuljahr</Form.Text>}
					</Form.Group>
				</div>
				<Table hover size="sm">
					<thead>
						<tr>
							<th></th>
							<th>Bezeichnung</th>
							<th>SFKZ</th>
							<th>Max.</th>
						</tr>
					</thead>
					<tbody>
						{sources.map(sc => (
							<tr key={sc.id}>
								<td>
									<Form.Check
										id={`copy-${sc.id}`}
										checked={selectedIDs.includes(sc.id)}
										onChange={e => toggle(sc.id, e.target.checked)} />
								</td>
								<td>
									<label htmlFor={`copy-${sc.id}`}>{sc.title}</label>
									{targetTitles.has(sc.title) && <span className="text-muted ms-2">(in {targetYear} bereits vorhanden)</span>}
								</td>
								<td>{sc.sfkz}</td>
								<td>{sc.maxPupils}</td>
							</tr>
						))}
					</tbody>
				</Table>
				<Form.Check
					type="switch"
					id="deactivateSource"
					label={`Ausgewählte Fachrichtungen aus ${sourceYear || 'dem Quell-Schuljahr'} deaktivieren`}
					checked={deactivateSource}
					onChange={e => setDeactivateSource(e.target.checked)} />
				{!deactivateSource && (
					<Alert variant="warning" className="mt-3 mb-0">
						Bleiben beide Schuljahre aktiv, sehen Bewerber:innen jede Fachrichtung doppelt.
					</Alert>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-secondary" onClick={onClose}>
					Abbrechen
				</Button>
				<Button variant="outline-primary" onClick={submit} disabled={saving || !targetYearValid || !selectedIDs.length}>
					Übernehmen
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default SchoolClassCopy;
