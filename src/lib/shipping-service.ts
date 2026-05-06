import api from "./api";

export interface ShippingFeeResult {
  provider: string;
  fee: number;
  estimatedDays: number;
}

export interface AddressValidationResult {
  valid: boolean;
  serviceable: boolean;
  suggestions: string[];
}

export interface TrackingEvent {
  id: number;
  status: string;
  location: string | null;
  description: string | null;
  eventTime: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status: string;
  history: TrackingEvent[];
  estimatedDelivery: string | null;
}

export interface ShippingOrder {
  id: number;
  orderId: number;
  provider: string;
  trackingNumber: string | null;
  status: string;
  shippingFee: number;
  estimatedDelivery: string | null;
  createdAt: string;
}

export const shippingService = {
  async calculateFee(params: {
    shippingAddress: string;
    ward?: string;
    district?: string;
    province?: string;
    weightGrams?: number;
    serviceType?: string;
  }): Promise<ShippingFeeResult> {
    const res = await api.post("/shipping/calculate-fee", params);
    return res.data;
  },

  async validateAddress(params: {
    address: string;
    ward?: string;
    district?: string;
    province?: string;
  }): Promise<AddressValidationResult> {
    const res = await api.post("/shipping/validate-address", params);
    return res.data;
  },

  async getTracking(shippingOrderId: number): Promise<TrackingResult> {
    const res = await api.get(`/shipping/track/${shippingOrderId}`);
    return res.data;
  },

  async getByOrderId(orderId: number): Promise<ShippingOrder[]> {
    const res = await api.get(`/shipping/order/${orderId}`);
    return res.data;
  },
};
