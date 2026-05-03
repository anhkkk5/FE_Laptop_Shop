"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  AlertCircle,
  Circle,
} from "lucide-react";
import { warrantyService, type WarrantyTicket, type RepairLog } from "@/lib/warranty-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  received: <Package className="h-4 w-4" />,
  diagnosing: <AlertCircle className="h-4 w-4" />,
  repairing: <Wrench className="h-4 w-4" />,
  waiting_parts: <Clock className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  returned: <CheckCircle2 className="h-4 w-4" />,
  rejected: <AlertCircle className="h-4 w-4" />,
};

const statusOrder = [
  "pending",
  "received",
  "diagnosing",
  "repairing",
  "waiting_parts",
  "completed",
  "returned",
];

const priorityLabel: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
};

function getStatusIndex(status: string): number {
  return statusOrder.indexOf(status);
}

export default function WarrantyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<WarrantyTicket | null>(null);
  const [logs, setLogs] = useState<RepairLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) return;
    async function load() {
      setLoading(true);
      try {
        const [t, l] = await Promise.all([
          warrantyService.getTicketById(ticketId),
          warrantyService.getTicketLogs(ticketId),
        ]);
        setTicket(t);
        setLogs(l);
      } catch {
        setError("Không thể tải thông tin ticket bảo hành");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="mt-4 text-destructive">{error || "Không tìm thấy ticket"}</p>
        <Button className="mt-6" onClick={() => router.push("/warranty")}>
          Quay lại bảo hành
        </Button>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(ticket.status);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link
        href="/warranty"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách bảo hành
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{ticket.ticketCode}</h1>
          <Badge variant={ticket.status === "completed" || ticket.status === "returned" ? "default" : "secondary"}>
            {statusLabel[ticket.status] || ticket.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Sản phẩm: <span className="font-medium text-foreground">{ticket.productName}</span> • Ưu tiên:{" "}
          {priorityLabel[ticket.priority]}
        </p>
      </div>

      <section className="rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold">Tiến trình xử lý</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6">
            {statusOrder.map((status, idx) => {
              const isPast = currentStatusIndex >= idx && currentStatusIndex !== -1;
              const isCurrent = ticket.status === status;
              const isFuture = currentStatusIndex < idx;
              const isRejected = ticket.status === "rejected";

              if (isRejected && status !== "pending") return null;

              return (
                <div key={status} className="relative flex items-start gap-4 pl-1">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : isPast
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      statusIcon[status] || <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-foreground"
                          : isPast
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {statusLabel[status]}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Đang xử lý ở bước này
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {ticket.status === "rejected" && (
              <div className="relative flex items-start gap-4 pl-1">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-destructive bg-destructive/10 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-destructive">{statusLabel.rejected}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Thông tin yêu cầu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Mô tả lỗi</p>
            <p className="font-medium">{ticket.issueDescription}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mã đơn hàng</p>
            <p className="font-medium">#{ticket.orderId}</p>
          </div>
          {ticket.diagnosis && (
            <div>
              <p className="text-muted-foreground">Chẩn đoán</p>
              <p className="font-medium">{ticket.diagnosis}</p>
            </div>
          )}
          {ticket.resolution && (
            <div>
              <p className="text-muted-foreground">Kết quả sửa chữa</p>
              <p className="font-medium">{ticket.resolution}</p>
            </div>
          )}
          {ticket.estimatedDays && (
            <div>
              <p className="text-muted-foreground">Dự kiến hoàn tất</p>
              <p className="font-medium">{ticket.estimatedDays} ngày</p>
            </div>
          )}
        </div>
      </section>

      {logs.length > 0 && (
        <section className="rounded-xl border p-5 space-y-3">
          <h2 className="font-semibold">Lịch sử xử lý</h2>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{statusLabel[log.status] || log.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {log.note && <p className="text-sm text-muted-foreground">{log.note}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
