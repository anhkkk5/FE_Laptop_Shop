import api from "./api";

export type PaymentMethod = "cod" | "sepay";
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

export interface SepayQrData {
  qrUrl: string;
  accountNo: string;
  bankCode: string;
  accountName: string;
  amount: number;
  transferCode: string;
  description: string;
}

export interface CreatePaymentResult {
  payment: Payment;
  sepayQr?: SepayQrData;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const paymentService = {
  async create(
    orderId: number,
    method: PaymentMethod,
  ): Promise<CreatePaymentResult> {
    const res = await api.post<ApiResponse<CreatePaymentResult>>(
      "/payments/create",
      { orderId, method },
    );
    return res.data.data;
  },

  async getStatus(orderId: number): Promise<Payment> {
    const res = await api.get<ApiResponse<Payment>>(
      `/payments/${orderId}/status`,
    );
    return res.data.data;
  },

  async getSepayQr(orderId: number): Promise<SepayQrData> {
    const res = await api.get<ApiResponse<SepayQrData>>(
      `/payments/${orderId}/sepay-qr`,
    );
    return res.data.data;
  },
};
