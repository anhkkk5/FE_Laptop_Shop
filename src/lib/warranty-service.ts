import api from "./api";

export type WarrantyTicketStatus =
  | "pending"
  | "received"
  | "diagnosing"
  | "repairing"
  | "waiting_parts"
  | "completed"
  | "returned"
  | "rejected";

export type WarrantyPriority = "low" | "medium" | "high" | "urgent";

export interface WarrantyTicket {
  id: number;
  ticketCode: string;
  userId: number;
  orderId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  status: WarrantyTicketStatus;
  priority: WarrantyPriority;
  issueDescription: string;
  diagnosis: string | null;
  resolution: string | null;
  assignedTo: number | null;
  estimatedDays: number | null;
  receivedAt: string | null;
  completedAt: string | null;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepairLog {
  id: number;
  ticketId: number;
  status: string;
  note: string | null;
  performedBy: number;
  createdAt: string;
}

export const warrantyService = {
  async createTicket(payload: {
    orderId: number;
    orderItemId: number;
    issueDescription: string;
    priority: WarrantyPriority;
  }) {
    const res = await api.post("/warranty", payload);
    return res.data.data as WarrantyTicket;
  },

  async getMyTickets(page: number = 1, limit: number = 10) {
    const res = await api.get("/warranty", { params: { page, limit } });
    return res.data.data as {
      data: WarrantyTicket[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  },

  async getTicketById(ticketId: number) {
    const res = await api.get(`/warranty/${ticketId}`);
    return res.data.data as WarrantyTicket;
  },

  async getTicketLogs(ticketId: number) {
    const res = await api.get(`/warranty/${ticketId}/logs`);
    return res.data.data as RepairLog[];
  },
};
