import api from "./api";

export type TechnicianTicketStatus =
  | "pending"
  | "received"
  | "diagnosing"
  | "repairing"
  | "waiting_parts"
  | "completed"
  | "returned"
  | "rejected";

export interface TechnicianTicket {
  id: number;
  ticketCode: string;
  productName: string;
  status: TechnicianTicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  issueDescription: string;
  diagnosis: string | null;
  resolution: string | null;
  estimatedDays: number | null;
  createdAt: string;
}

type PaginatedPayload<T> = {
  data?: {
    data?: T[];
  };
};

function normalizeTickets(payload: PaginatedPayload<TechnicianTicket>): TechnicianTicket[] {
  return payload?.data?.data || [];
}

export const technicianService = {
  async getTickets(page: number = 1, limit: number = 30): Promise<TechnicianTicket[]> {
    const { data } = await api.get<PaginatedPayload<TechnicianTicket>>(
      "/admin/warranty/all",
      {
        params: { page, limit },
      },
    );
    return normalizeTickets(data);
  },

  async updateTicketStatus(
    ticketId: number,
    payload: {
      status: TechnicianTicketStatus;
      diagnosis?: string;
      resolution?: string;
      estimatedDays?: number;
    },
  ): Promise<void> {
    await api.patch(`/admin/warranty/${ticketId}/status`, payload);
  },
};
