"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  notificationService,
  type NotificationItem,
} from "@/lib/notification-service";
import { useAuth } from "@/context/auth-context";

export default function NotificationBell() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }

    try {
      const data = await notificationService.getUnreadCount();
      setUnread(data.unread);
    } catch {
      /* silent */
    }
  }, [isAuthenticated]);

  const fetchList = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const result = await notificationService.getMyNotifications(1, 10);
      setItems(
        result.data.filter((notification) => notification.userId === user?.id),
      );
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setUnread(0);
      setItems([]);
      return;
    }

    void fetchUnread();

    // SSE for real-time notifications
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    const es = new EventSource(`${API_URL}/notifications/stream`, {
      withCredentials: true,
    });

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const notification: NotificationItem = payload.data ?? payload;
        if (notification.userId !== user.id) {
          return;
        }
        setUnread((prev) => prev + 1);
        setItems((prev) => [notification, ...prev].slice(0, 50));
      } catch {
        /* ignore parse errors */
      }
    };

    return () => es.close();
  }, [fetchUnread, isAuthenticated, user?.id]);

  useEffect(() => {
    if (open) {
      void fetchList();
    }
  }, [open, fetchList]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnread(0);
    } catch {
      /* silent */
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await notificationService.markAsRead(id);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex flex-col items-center gap-0.5 text-emerald-950"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
        <span className="text-[10px] font-medium hidden sm:inline">
          Thông báo
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-popover shadow-md">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">Thông báo</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3" />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Đang tải...
              </p>
            ) : items.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Không có thông báo
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.isRead) {
                      void handleMarkRead(item.id);
                    }
                  }}
                  className={`cursor-pointer border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted ${
                    item.isRead ? "opacity-60" : "font-medium"
                  }`}
                >
                  <p className="line-clamp-1">{item.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.content}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t px-3 py-2">
            <Link
              href="/notifications"
              className="block text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
