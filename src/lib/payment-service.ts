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

export const paymentService = {
  async create(orderId: number, method: PaymentMethod): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>("/payments/create", {
      orderId,
      method,
    });
    return res.data.data;
  },

  async getStatus(orderId: number): Promise<Payment> {
    const res = await api.get<ApiResponse<Payment>>(`/payments/${orderId}/status`);
    return res.data.data;
  },
};
