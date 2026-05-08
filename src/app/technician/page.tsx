"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  technicianService,
  type TechnicianTicket,
  type TechnicianTicketStatus,
} from "@/lib/technician-service";
import { useAuth } from "@/context/auth-context";

const statusOptions: TechnicianTicketStatus[] = [
  "received",
  "diagnosing",
  "repairing",
  "waiting_parts",
  "completed",
  "returned",
  "rejected",
];

const statusLabel: Record<TechnicianTicketStatus, string> = {
  pending: "Chờ tiếp nhận",
  received: "Đã nhận máy",
  diagnosing: "Đang chẩn đoán",
  repairing: "Đang sửa",
  waiting_parts: "Chờ linh kiện",
  completed: "Đã sửa xong",
  returned: "Đã trả máy",
  rejected: "Từ chối bảo hành",
};

type TechnicianSection = "overview" | "intake" | "in-progress" | "closure";

export default function TechnicianPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tickets, setTickets] = useState<TechnicianTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [activeSection, setActiveSection] =
    useState<TechnicianSection>("overview");

  const intakeTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.status === "pending" || ticket.status === "received",
      ),
    [tickets],
  );
  const inProgressTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status === "diagnosing" ||
          ticket.status === "repairing" ||
          ticket.status === "waiting_parts",
      ),
    [tickets],
  );
  const closureTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status === "completed" ||
          ticket.status === "returned" ||
          ticket.status === "rejected",
      ),
    [tickets],
  );

  const sectionTickets = useMemo(() => {
    if (activeSection === "intake") return intakeTickets;
    if (activeSection === "in-progress") return inProgressTickets;
    if (activeSection === "closure") return closureTickets;
    return tickets;
  }, [
    activeSection,
    closureTickets,
    inProgressTickets,
    intakeTickets,
    tickets,
  ]);

  async function loadTickets() {
    setLoading(true);
    setError(null);
    try {
      const data = await technicianService.getTickets(1, 30);
      setTickets(data);
    } catch {
      setError("Không thể tải ticket bảo hành.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "technician") {
      setLoading(false);
      return;
    }
    void loadTickets();
  }, [isAuthenticated, user?.role]);

  async function handleStatusChange(
    ticket: TechnicianTicket,
    status: TechnicianTicketStatus,
  ) {
    setSavingId(ticket.id);
    setError(null);
    try {
      await technicianService.updateTicketStatus(ticket.id, {
        status,
        diagnosis: ticket.diagnosis || undefined,
        resolution: ticket.resolution || undefined,
        estimatedDays: ticket.estimatedDays || undefined,
      });
      setTickets((prev) =>
        prev.map((item) =>
          item.id === ticket.id ? { ...item, status } : item,
        ),
      );
    } catch {
      setError("Cập nhật trạng thái sửa chữa thất bại.");
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Đang tải khu vực kỹ thuật viên...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border p-6 text-center space-y-4">
          <h1 className="text-xl font-bold">Bạn chưa đăng nhập</h1>
          <Link href="/login" className="text-sm font-medium underline">
            Đăng nhập để tiếp tục
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "technician") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border p-6 text-center space-y-3">
          <h1 className="text-xl font-bold">Không có quyền truy cập</h1>
          <p className="text-sm text-muted-foreground">
            Khu vực này dành cho vai trò Kỹ thuật viên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Khu vực kỹ thuật viên</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Nhận ticket bảo hành và cập nhật tiến độ sửa chữa.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSection("overview")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "overview"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Tổng quan
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("intake")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "intake"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Tiếp nhận
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("in-progress")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "in-progress"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Đang xử lý sửa chữa
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("closure")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "closure"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Hoàn tất / Trả máy
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {activeSection === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Tổng ticket
            </p>
            <p className="mt-2 text-2xl font-bold">{tickets.length}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Ticket tiếp nhận
            </p>
            <p className="mt-2 text-2xl font-bold text-lime-600">
              {intakeTickets.length}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Ticket đang sửa
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {inProgressTickets.length}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Ticket đã chốt
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {closureTickets.length}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="font-semibold">
            {activeSection === "intake" && "Ticket chờ tiếp nhận"}
            {activeSection === "in-progress" && "Ticket đang xử lý sửa chữa"}
            {activeSection === "closure" && "Ticket đã hoàn tất / trả máy"}
            {activeSection === "overview" && "Ticket bảo hành"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-4 py-3 text-left font-medium">Mã ticket</th>
                <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-3 text-left font-medium">Mức độ</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {sectionTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">
                    #{ticket.ticketCode}
                  </td>
                  <td className="px-4 py-3">{ticket.productName}</td>
                  <td className="px-4 py-3 uppercase text-xs">
                    {ticket.priority}
                  </td>
                  <td className="px-4 py-3">{statusLabel[ticket.status]}</td>
                  <td className="px-4 py-3">
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                      value={ticket.status}
                      disabled={savingId === ticket.id}
                      onChange={(e) =>
                        void handleStatusChange(
                          ticket,
                          e.target.value as TechnicianTicketStatus,
                        )
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {sectionTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Không có ticket trong mục này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
