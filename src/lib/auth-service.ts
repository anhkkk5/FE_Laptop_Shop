import api from "./api";
import { AxiosError } from "axios";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiError;
    return data.message || "Đã xảy ra lỗi";
  }
  return "Không thể kết nối đến server";
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<AuthTokens> {
    try {
      const res = await api.post<ApiResponse<AuthTokens>>(
        "/auth/register",
        data,
      );
      const tokens = res.data.data;
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async login(email: string, password: string): Promise<AuthTokens> {
    try {
      const res = await api.post<ApiResponse<AuthTokens>>("/auth/login", {
        email,
        password,
      });
      const tokens = res.data.data;
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  async getMe(): Promise<User> {
    try {
      const res = await api.get<ApiResponse<User>>("/auth/me");
      return res.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async forgotPassword(email: string): Promise<string> {
    try {
      const res = await api.post<ApiResponse<{ message: string }>>(
        "/auth/forgot-password",
        { email },
      );
      return res.data.data.message;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const res = await api.post<ApiResponse<{ message: string }>>(
        "/auth/reset-password",
        { token, newPassword },
      );
      return res.data.data.message;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async verifyEmail(token: string): Promise<string> {
    try {
      const res = await api.post<ApiResponse<{ message: string }>>(
        "/auth/verify-email",
        { token },
      );
      return res.data.data.message;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async resendVerification(): Promise<void> {
    try {
      await api.post("/auth/resend-verification");
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getGoogleLoginUrl(): string {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100/api/v1";
    return `${apiUrl}/auth/google`;
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },
};
