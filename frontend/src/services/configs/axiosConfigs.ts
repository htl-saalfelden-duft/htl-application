import axios from "axios"
import { responseErrorHandler } from "./error.interceptor";
import { requestAuthHandler } from "./auth.interceptor";
import { responseDateHandler } from "./date.interceptor";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
})

api.interceptors.request.use((config) => requestAuthHandler(config))
api.interceptors.response.use(undefined, (error) => responseErrorHandler(error))
api.interceptors.response.use((response) => responseDateHandler(response))