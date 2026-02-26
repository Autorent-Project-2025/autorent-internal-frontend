import { apiClient } from "./http";
export async function registerUser(payload) {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
}
export async function loginUser(payload) {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
}
