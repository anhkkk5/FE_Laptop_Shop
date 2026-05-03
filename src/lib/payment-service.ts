import api from "./api";

export type PaymentMethod = "cod" | "vietqr" | "momo";
export type PaymentStatus = "pending" | "success" | "failed";

export interface Payment {
  id: number;
  orderId: number;
  userId: number;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionCode: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface VietQrResponse {
  qrUrl: string;
  bankId: string;
  accountNo: string;
  amount: number;
  description: string;
}

export interface MomoResponse {
  payUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
  orderId: string;
  requestId: string;
  resultCode: number;
  message: string;
}

export const paymentService = {
  async create(orderId: number, method: PaymentMethod): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>("/payments/create", {
      orderId,
      method,
    });
    return res.data.data;
  },

  async getStatus(orderId: number): Promise<Payment> {
    const res = await api.get<ApiResponse<Payment>>(
      `/payments/${orderId}/status`,
    );
    return res.data.data;
  },

  async getVietQr(orderId: number): Promise<VietQrResponse> {
    const res = await api.get<ApiResponse<VietQrResponse>>(
      `/payments/${orderId}/vietqr`,
    );
    return res.data.data;
  },

  async createMomo(orderId: number): Promise<MomoResponse> {
    const res = await api.post<ApiResponse<MomoResponse>>(
      `/payments/${orderId}/momo`,
    );
    return res.data.data;
  },
};
