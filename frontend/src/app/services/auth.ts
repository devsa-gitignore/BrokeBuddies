import { apiRequest } from "./api";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export interface BackendAuthUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "judge" | "mentor";
  phoneNumber?: string;
  isVerified?: boolean;
}

interface LoginResponse extends BackendAuthUser {
  token: string;
  refreshToken: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  phoneNumber?: string;
}

export async function registerUser(payload: RegisterPayload) {
  return apiRequest<{ message: string; userId: string }>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function verifyOtp(email: string, otp: string) {
  return apiRequest<{ message: string }>("/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export async function resendOtp(email: string) {
  return apiRequest<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: { email },
  });
}

export async function loginUser(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  localStorage.setItem(ACCESS_TOKEN_KEY, response.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

  return response;
}

export async function logoutUser(userId?: string) {
  const token = getAccessToken();

  try {
    await apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
      token: token || undefined,
      body: userId ? { userId } : {},
    });
  } finally {
    clearAuthTokens();
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

