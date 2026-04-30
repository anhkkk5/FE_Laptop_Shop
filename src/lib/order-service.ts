import api from "./api";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod?: "cod";
}

export const orderService = {
  async create(data: CreateOrderPayload): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>("/orders", data);
    return res.data.data;
  },

  async getMine(page: number = 1, limit: number = 10): Promise<PaginatedResult<Order>> {
    const res = await api.get<ApiResponse<PaginatedResult<Order>>>("/orders", {
      params: { page, limit },
    });
    return res.data.data;
  },

  async getMineById(id: number): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  async cancel(id: number): Promise<void> {
    await api.patch(`/orders/${id}/cancel`);
  },
};
