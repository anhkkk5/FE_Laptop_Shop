import api from "./api";

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  productImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
}

export interface CartData {
  id?: number;
  userId?: number;
  items: CartItem[];
  summary: CartSummary;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const cartService = {
  async getMyCart(): Promise<CartData> {
    const res = await api.get<ApiResponse<CartData>>("/cart");
    return res.data.data;
  },

  async addItem(productId: number, quantity: number): Promise<CartData> {
    const res = await api.post<ApiResponse<CartData>>("/cart/items", {
      productId,
      quantity,
    });
    return res.data.data;
  },

  async updateItem(itemId: number, quantity: number): Promise<CartData> {
    const res = await api.patch<ApiResponse<CartData>>(`/cart/items/${itemId}`, {
      quantity,
    });
    return res.data.data;
  },

  async removeItem(itemId: number): Promise<CartData> {
    const res = await api.delete<ApiResponse<CartData>>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  async clearCart(): Promise<CartData> {
    const res = await api.delete<ApiResponse<CartData>>("/cart");
    return res.data.data;
  },
};
