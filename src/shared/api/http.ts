import axios from "axios";
import { clearSession, getAccessToken } from "@/features/auth/session";

export const apiClient = axios.create({
  baseURL: "/",
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearSession({ redirect: true });
    }

    return Promise.reject(error);
  },
);
