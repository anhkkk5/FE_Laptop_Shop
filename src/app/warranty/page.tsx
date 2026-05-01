"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { orderService, type Order } from "@/lib/order-service";
import {
  warrantyService,
  type WarrantyPriority,
  type WarrantyTicket,
} from "@/lib/warranty-service";
import { Button } from "@/components/ui/button";

const statusLabel: Record<string, string> = {
  pending: "Chờ tiếp nhận",
  received: "Đã tiếp nhận",
  diagnosing: "Đang chẩn đoán",
  repairing: "Đang sửa",
  waiting_parts: "Chờ linh kiện",
  completed: "Đã hoàn tất",
  returned: "Đã trả khách",
  rejected: "Từ chối bảo hành",
};

const priorityLabel: Record<WarrantyPriority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
};

export default function WarrantyPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<WarrantyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number>(0);
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState<WarrantyPriority>("medium");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  async function loadData() {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [orderResult, ticketResult] = await Promise.all([
        orderService.getMine(1, 50),
        warrantyService.getMyTickets(1, 20),
      ]);
      setOrders(orderResult.data);
      setTickets(ticketResult.data);
    } catch {
      setError("Không thể tải dữ liệu bảo hành");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [isAuthenticated]);

  async function handleSubmitTicket() {
    if (!selectedOrderId || !selectedOrderItemId) {
      setError("Vui lòng chọn đơn hàng và sản phẩm cần bảo hành");
      return;
    }

    if (issueDescription.trim().length < 10) {
      setError("Mô tả lỗi cần ít nhất 10 ký tự");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await warrantyService.createTicket({
        orderId: selectedOrderId,
        orderItemId: selectedOrderItemId,
        issueDescription: issueDescription.trim(),
        priority,
      });
      setIssueDescription("");
      setPriority("medium");
      setSelectedOrderItemId(0);
      setSuccess("Đã gửi yêu cầu bảo hành thành công");
      await loadData();
    } catch {
      setError("Không thể gửi yêu cầu bảo hành");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-3">
        <h1 className="text-2xl font-bold">Bảo hành</h1>
        <p className="text-muted-foreground">Vui lòng đăng nhập để gửi yêu cầu bảo hành.</p>
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
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Bảo hành sản phẩm</h1>
        <p className="text-muted-foreground">
          Gửi yêu cầu bảo hành cho sản phẩm đã mua và theo dõi tiến trình xử lý.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border py-16">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <section className="rounded-xl border p-4 space-y-4">
            <h2 className="font-semibold">Tạo ticket bảo hành</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Đơn hàng</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedOrderId}
                  onChange={(event) => {
                    const orderId = Number(event.target.value);
                    setSelectedOrderId(orderId);
                    setSelectedOrderItemId(0);
                  }}
                >
                  <option value={0}>-- Chọn đơn hàng --</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.orderCode} - {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Sản phẩm</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedOrderItemId}
                  onChange={(event) => {
                    setSelectedOrderItemId(Number(event.target.value));
                  }}
                  disabled={!selectedOrder}
                >
                  <option value={0}>-- Chọn sản phẩm --</option>
                  {(selectedOrder?.items || []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.productName} (x{item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Mức độ ưu tiên</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm md:w-64"
                value={priority}
                onChange={(event) => setPriority(event.target.value as WarrantyPriority)}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Mô tả lỗi</label>
              <textarea
                className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Mô tả chi tiết tình trạng sản phẩm..."
                value={issueDescription}
                onChange={(event) => setIssueDescription(event.target.value)}
              />
            </div>

            <Button onClick={handleSubmitTicket} disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi yêu cầu bảo hành"}
            </Button>
          </section>

          <section className="rounded-xl border p-4 space-y-3">
            <h2 className="font-semibold">Ticket của tôi</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bạn chưa có ticket bảo hành nào.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{ticket.ticketCode}</p>
                      <span className="text-sm text-muted-foreground">
                        {statusLabel[ticket.status] || ticket.status}
                      </span>
                    </div>
                    <p className="text-sm">{ticket.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Ưu tiên: {priorityLabel[ticket.priority]} • Tạo lúc:{" "}
                      {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
