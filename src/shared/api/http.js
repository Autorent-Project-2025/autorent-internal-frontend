import axios from "axios";
import { clearSession, getAccessToken } from "@/features/auth/session";
const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl = rawApiUrl && rawApiUrl.length > 0
    ? rawApiUrl.replace(/\/+$/, "")
    : "http://localhost:5253";
export const apiClient = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15_000,
});
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
apiClient.interceptors.response.use((response) => response, (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSession({ redirect: true });
    }
    return Promise.reject(error);
});
