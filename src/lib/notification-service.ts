import api from "./api";

export type NotificationType = "order" | "payment" | "warranty" | "system";

export interface NotificationItem {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  data: NotificationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationService = {
  async getMyNotifications(page = 1, limit = 20): Promise<NotificationListResult> {
    const res = await api.get("/notifications", { params: { page, limit } });
    return res.data.data;
  },

  async getUnreadCount(): Promise<{ unread: number }> {
    const res = await api.get("/notifications/unread-count");
    return res.data.data;
  },

  async markAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};
