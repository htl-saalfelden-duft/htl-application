import axios from "axios"

export const api = axios.create({
  // withCredentials: true,
  baseURL: process.env.REACT_APP_APIURL,
})

// defining a custom error handler for all APIs
const errorHandler = (error: any) => {
  const statusCode = error.response?.status

  // logging only errors that are not 401
  if (statusCode && statusCode !== 401) {
    console.error(error)
  }

  return Promise.reject(error)
}

// registering the custom error handler to the
// "api" axios instance
api.interceptors.response.use(undefined, (error) => errorHandler(error))


api.interceptors.request.use((config) => {
  const idToken = localStorage.getItem('idToken');
  if (idToken) {
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
})