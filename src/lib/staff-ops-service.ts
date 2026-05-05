import api from "./api";

export type StaffOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_to_ship"
  | "shipping"
  | "delivered"
  | "completed"
  | "refunded"
  | "cancelled";

export interface StaffOrder {
  id: number;
  orderCode: string;
  status: StaffOrderStatus;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
}

export interface PaymentInfo {
  id: number;
  orderId: number;
  status: string;
  provider: string;
  amount: number;
  paidAt: string | null;
}

type PaginatedPayload<T> = {
  data?: {
    data?: T[];
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  };
};

function normalizeOrders(payload: PaginatedPayload<StaffOrder>): StaffOrder[] {
  return payload?.data?.data || [];
}

export const staffOpsService = {
  async getOrders(page: number = 1, limit: number = 20): Promise<StaffOrder[]> {
    const { data } = await api.get<PaginatedPayload<StaffOrder>>(
      "/admin/orders",
      {
        params: { page, limit },
      },
    );
    return normalizeOrders(data);
  },

  async updateOrderStatus(
    orderId: number,
    status: StaffOrderStatus,
  ): Promise<void> {
    await api.patch(`/admin/orders/${orderId}/status`, { status });
  },

  async getPaymentByOrder(orderId: number): Promise<PaymentInfo | null> {
    const { data } = await api.get<{ data?: PaymentInfo } | PaymentInfo>(
      `/admin/payments/${orderId}`,
    );
    const normalized =
      (data as { data?: PaymentInfo })?.data || (data as PaymentInfo);
    if (!normalized || typeof normalized !== "object") return null;
    return normalized;
  },
};
