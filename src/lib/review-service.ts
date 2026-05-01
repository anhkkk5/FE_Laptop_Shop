import api from "./api";

export interface Review {
  id: number;
  productId: number;
  userId: number;
  orderItemId: number;
  rating: number;
  comment: string | null;
  images: string[] | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResult {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    averageRating: number;
  };
}

export const reviewService = {
  async getByProductId(productId: number, page: number = 1, limit: number = 10) {
    const res = await api.get(`/reviews/product/${productId}`, { params: { page, limit } });
    return res.data.data as ReviewListResult;
  },

  async create(payload: {
    orderId: number;
    orderItemId: number;
    rating: number;
    comment?: string;
    images?: string[];
  }) {
    const res = await api.post("/reviews", payload);
    return res.data.data as Review;
  },

  async update(
    id: number,
    payload: {
      rating?: number;
      comment?: string;
      images?: string[];
    },
  ) {
    const res = await api.patch(`/reviews/${id}`, payload);
    return res.data.data as Review;
  },

  async remove(id: number) {
    await api.delete(`/reviews/${id}`);
  },
};
