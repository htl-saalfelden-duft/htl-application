import { AxiosResponse } from "axios"

export const responseDateHandler = (response: AxiosResponse) => {
    convertToDate(response.data)
    return response
}

const convertToDate = (data: any) => {
    if (data === null || data === undefined) {
        return data
    }

    if (typeof data !== 'object') {
        return data
    }

    for (const key of Object.keys(data)) {
        const value = data[key]
        if (isIso8601(value)) {
            data[key] = new Date(value)
        } else if (typeof value === 'object') {
            convertToDate(value)
        }
    }
}

const isIso8601 = (value: any) => {
    const iso8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/

    if (value === null || value === undefined) {
        return false
    }

    return iso8601.test(value)
}
