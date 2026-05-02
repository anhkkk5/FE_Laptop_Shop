import api from "./api";
import { AxiosError } from "axios";

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
  }): Promise<User> {
    try {
      const res = await api.post<ApiResponse<{ user: User }>>(
        "/auth/register",
        data,
      );
      return res.data.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const res = await api.post<ApiResponse<{ user: User }>>("/auth/login", {
        email,
        password,
      });
      return res.data.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore errors during logout
      console.error("Logout error:", error);
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
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    return `${apiUrl}/auth/google`;
  },

  async checkAuth(): Promise<boolean> {
    try {
      await this.getMe();
      return true;
    } catch {
      return false;
    }
  },
};
