"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  staffOpsService,
  type StaffOrder,
  type StaffOrderStatus,
} from "@/lib/staff-ops-service";
import { useAuth } from "@/context/auth-context";

function getStaffAllowedTransitions(
  status: StaffOrderStatus,
): StaffOrderStatus[] {
  if (status === "pending") return ["confirmed", "cancelled"];
  if (status === "shipping") return ["delivered"];
  if (status === "delivered") return ["completed"];
  return [];
}

function getResponsibleRole(status: StaffOrderStatus): "staff" | "warehouse" {
  if (
    status === "confirmed" ||
    status === "processing" ||
    status === "ready_to_ship"
  ) {
    return "warehouse";
  }
  return "staff";
}

const statusLabel: Record<StaffOrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Kho đang xử lý",
  ready_to_ship: "Sẵn sàng giao",
  shipping: "Đang giao",
  delivered: "Đã giao hàng",
  completed: "Hoàn tất",
  refunded: "Đã hoàn tiền",
  cancelled: "Đã hủy",
};

type StaffSection =
  | "overview"
  | "new-orders"
  | "warehouse-handoff"
  | "delivery-closure";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export default function StaffOpsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<StaffSection>("overview");

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders],
  );
  const warehouseHandoffOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "confirmed" ||
          order.status === "processing" ||
          order.status === "ready_to_ship",
      ),
    [orders],
  );
  const deliveryClosureOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "shipping" || order.status === "delivered",
      ),
    [orders],
  );

  const sectionOrders = useMemo(() => {
    if (activeSection === "new-orders") return pendingOrders;
    if (activeSection === "warehouse-handoff") return warehouseHandoffOrders;
    if (activeSection === "delivery-closure") return deliveryClosureOrders;
    return orders;
  }, [
    activeSection,
    deliveryClosureOrders,
    orders,
    pendingOrders,
    warehouseHandoffOrders,
  ]);

  async function loadOrders() {
    setError(null);
    setLoading(true);
    try {
      const data = await staffOpsService.getOrders(1, 30);
      setOrders(data);
    } catch {
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "staff") {
      setLoading(false);
      return;
    }
    void loadOrders();
  }, [isAuthenticated, user?.role]);

  async function handleChangeStatus(
    orderId: number,
    nextStatus: StaffOrderStatus,
  ) {
    setSavingOrderId(orderId);
    setError(null);
    try {
      await staffOpsService.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: nextStatus } : order,
        ),
      );
    } catch {
      setError("Cập nhật trạng thái đơn thất bại.");
    } finally {
      setSavingOrderId(null);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Đang tải khu vực nhân viên...
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

  if (user?.role !== "staff") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border p-6 text-center space-y-3">
          <h1 className="text-xl font-bold">Không có quyền truy cập</h1>
          <p className="text-sm text-muted-foreground">
            Khu vực này dành cho vai trò Nhân viên bán hàng.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Khu vực nhân viên bán hàng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xác nhận đơn, cập nhật trạng thái và theo dõi xử lý đơn hàng.
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
          onClick={() => setActiveSection("new-orders")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "new-orders"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Đơn mới cần duyệt
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("warehouse-handoff")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "warehouse-handoff"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Đang phối hợp kho
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("delivery-closure")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "delivery-closure"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Chốt giao hàng
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
              Tổng đơn đang theo dõi
            </p>
            <p className="mt-2 text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Đơn mới chờ duyệt
            </p>
            <p className="mt-2 text-2xl font-bold text-lime-600">
              {pendingOrders.length}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Đơn kho đang xử lý
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {warehouseHandoffOrders.length}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Đơn chờ chốt
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {deliveryClosureOrders.length}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="font-semibold">
            {activeSection === "new-orders" && "Đơn mới cần duyệt"}
            {activeSection === "warehouse-handoff" && "Đơn đang phối hợp kho"}
            {activeSection === "delivery-closure" && "Đơn cần chốt giao"}
            {activeSection === "overview" && "Danh sách đơn hàng gần đây"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium">Phụ trách</th>
                <th className="px-4 py-3 text-left font-medium">
                  Cập nhật nhanh
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionOrders.map((order) => {
                const allowedTransitions = getStaffAllowedTransitions(
                  order.status,
                );
                const responsibleRole = getResponsibleRole(order.status);
                const selectableStatuses: StaffOrderStatus[] = [
                  order.status,
                  ...allowedTransitions,
                ];

                return (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      #{order.orderCode}
                    </td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerPhone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatPrice(Number(order.total || 0))}
                    </td>
                    <td className="px-4 py-3">{statusLabel[order.status]}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          responsibleRole === "warehouse"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {responsibleRole === "warehouse"
                          ? "Kho hàng"
                          : "Nhân viên"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                        value={order.status}
                        disabled={
                          savingOrderId === order.id ||
                          allowedTransitions.length === 0
                        }
                        onChange={(e) => {
                          const nextStatus = e.target.value as StaffOrderStatus;
                          if (nextStatus === order.status) return;
                          void handleChangeStatus(order.id, nextStatus);
                        }}
                      >
                        {selectableStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {sectionOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Không có đơn hàng trong mục này.
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
