import { api } from "./configs/axiosConfigs"

export const ApplicantService = {
    get: async (id: number) => {
        const response = await api.get(`/applicant/${id}`)

        return response.data.application
    },
    register: async (data: any) => {
        const response = await api.request({
            url: `/applicant/register`,
            method: 'POST',
            data
        })

        return response.data
    },
    confirm: async (token: string) => {
        const response = await api.request({
            url: `/applicant/confirm`,
            method: 'POST',
            data: {
                token
            }
        })

        return response.data.application
    },
    signinApplicant: async (data: any) => {
        const response = await api.request({
            url: `/applicant/signInUser`,
            method: 'POST',
            data
        })

        return response.data
    }       
}