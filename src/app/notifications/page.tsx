"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  notificationService,
  type NotificationItem,
} from "@/lib/notification-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const POLL_INTERVAL_MS = 15000;

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | "all" | null>(null);
  const [unread, setUnread] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const [list, unreadResult] = await Promise.all([
        notificationService.getMyNotifications(1, 30),
        notificationService.getUnreadCount(),
      ]);
      setItems(list.data);
      setUnread(unreadResult.unread);
    } catch {
      setError("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const id = setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isAuthenticated, loadNotifications]);

  async function handleMarkAsRead(notificationId: number) {
    setUpdating(notificationId);
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch {
      setError("Không thể cập nhật trạng thái đã đọc");
    } finally {
      setUpdating(null);
    }
  }

  async function handleMarkAllAsRead() {
    setUpdating("all");
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch {
      setError("Không thể đánh dấu đã đọc tất cả");
    } finally {
      setUpdating(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-3">
        <h1 className="text-2xl font-bold">Thông báo</h1>
        <p className="text-muted-foreground">Vui lòng đăng nhập để xem thông báo.</p>
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Thông báo của tôi</h1>
          <p className="text-sm text-muted-foreground">
            Đồng bộ tự động mỗi {Math.floor(POLL_INTERVAL_MS / 1000)} giây.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={unread > 0 ? "default" : "secondary"}>
            {unread} chưa đọc
          </Badge>
          <Button
            variant="outline"
            disabled={updating === "all" || unread === 0}
            onClick={handleMarkAllAsRead}
          >
            {updating === "all" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border py-16">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border py-12 text-center text-muted-foreground">
          <Bell className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p>Bạn chưa có thông báo nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-4 ${
                item.isRead ? "bg-background" : "bg-primary/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                {!item.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === item.id}
                    onClick={() => handleMarkAsRead(item.id)}
                  >
                    {updating === item.id && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
