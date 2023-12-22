import { useMemo } from "react"
import { ApiService } from "../services/api.service"

import { Table } from "react-bootstrap"
import { ArrowDown, ArrowUp, Trash } from "react-bootstrap-icons"

interface Props {
}

const Applications = (props: Props) => {
    const apiService = useMemo(() => new ApiService(), [])

    // useEffect(() => {
    //     apiService.get<Application[]>(Application, undefined, { applicantId: 1 })
    // })

    // const getSchoolClasses= (inputValue: string) => {
    //     return apiService.get<SchoolClass[]>(SchoolClass)
    // }

    return (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Priorität</th>
                  <th>Ausbildungsrichtung</th>
                  <th>Ort</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Höhere Abteilung für Bautechnik</td>
                  <td>BT-Saalfelden</td>
                  <td>
                    <button className="btn btn-outline-danger me-2"><Trash /></button>
                    <button className="btn btn-outline-primary"><ArrowDown /></button>
                  </td>
                </tr>
              </tbody>
            </Table>
    )
}

export {Applications}