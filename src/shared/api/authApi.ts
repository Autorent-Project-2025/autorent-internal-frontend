import { apiClient } from "./http";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  fullName: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}
