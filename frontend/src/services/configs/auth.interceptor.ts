import { InternalAxiosRequestConfig } from "axios";

export const requestAuthHandler = (config: InternalAxiosRequestConfig) => {
    const idToken = localStorage.getItem('idToken');
    if (idToken) {
        config.headers!.Authorization = `Bearer ${idToken}`;
    }
    return config;
}