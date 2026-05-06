import api from "./api";

export interface ReturnRequest {
  id: number;
  returnCode: string;
  orderId: number;
  orderCode: string;
  status: string;
  returnReason: string;
  returnDescription: string | null;
  evidencePhotos: string[] | null;
  refundMethod: string | null;
  refundAmount: number | null;
  refundBreakdown: Record<string, number> | null;
  trackingNumber: string | null;
  labelUrl: string | null;
  rejectionReason: string | null;
  isFlaggedFraud: boolean;
  createdAt: string;
  updatedAt: string;
  items: ReturnItem[];
}

export interface ReturnItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export const returnService = {
  async checkEligibility(orderId: number): Promise<EligibilityResult> {
    const res = await api.get(`/returns/eligibility/${orderId}`);
    return res.data;
  },

  async submit(data: { orderId: number; returnReason: string; returnDescription?: string; evidencePhotos?: string[] }): Promise<ReturnRequest> {
    const res = await api.post("/returns/submit", data);
    return res.data;
  },

  async getMyReturns(page = 1, limit = 20): Promise<{ data: ReturnRequest[]; total: number }> {
    const res = await api.get("/returns", { params: { page, limit } });
    return res.data;
  },

  async getById(id: number): Promise<ReturnRequest> {
    const res = await api.get(`/returns/${id}`);
    return res.data;
  },

  async selectRefundMethod(id: number, data: { refundMethod: string; bankAccount?: string; bankName?: string; bankHolder?: string }): Promise<ReturnRequest> {
    const res = await api.patch(`/returns/${id}/refund-method`, data);
    return res.data;
  },

  async cancel(id: number): Promise<void> {
    await api.patch(`/returns/${id}/cancel`);
  },
};
