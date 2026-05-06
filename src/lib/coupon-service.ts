import api from "./api";

export type CouponDiscountType =
  | "fixed_amount"
  | "percentage"
  | "free_shipping"
  | "buy_x_get_y";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  usageLimitPerUser: number | null;
  startAt: string | null;
  endAt: string | null;
  applicableProductIds: number[] | null;
  applicableCategoryIds: number[] | null;
  applicableBrandIds: number[] | null;
  firstTimeCustomerOnly: boolean;
  isStackable: boolean;
  priority: number;
  buyQuantity: number | null;
  getQuantity: number | null;
  isActive: boolean;
  isCollected?: boolean;
}

export interface CouponCollectionItem {
  collectionId: number;
  collectedAt: string;
  coupon: Coupon;
  isExpired: boolean;
  isUsable: boolean;
}

export interface CouponValidationResult {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  isFreeShipping?: boolean;
}

export interface BestVoucherSuggestion {
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;
  isFreeShipping: boolean;
  total: number;
}

export interface BestForCartResponse {
  suggestions: BestVoucherSuggestion[];
  subtotal: number;
}

export const couponService = {
  async getActive(): Promise<Coupon[]> {
    const res = await api.get<ApiResponse<Coupon[]>>("/coupons/active");
    return res.data.data;
  },

  async collect(couponId: number): Promise<void> {
    await api.post(`/coupons/collect/${couponId}`);
  },

  async getMyCollection(): Promise<CouponCollectionItem[]> {
    const res = await api.get<ApiResponse<CouponCollectionItem[]>>(
      "/coupons/my-collection",
    );
    return res.data.data;
  },

  async getBestForCart(): Promise<BestForCartResponse> {
    const res = await api.get<ApiResponse<BestForCartResponse>>(
      "/coupons/best-for-cart",
    );
    return res.data.data;
  },

  async validate(code: string): Promise<CouponValidationResult> {
    const res = await api.post<ApiResponse<CouponValidationResult>>(
      "/coupons/validate",
      { code },
    );
    return res.data.data;
  },
};
