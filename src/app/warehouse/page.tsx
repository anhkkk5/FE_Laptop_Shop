"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  warehouseService,
  type InventorySummary,
  type WarehouseProduct,
} from "@/lib/warehouse-service";
import {
  staffOpsService,
  type StaffOrder,
  type StaffOrderStatus,
} from "@/lib/staff-ops-service";

const orderStatusLabel: Record<StaffOrderStatus, string> = {
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

function getWarehouseNextStatus(
  status: StaffOrderStatus,
): StaffOrderStatus | null {
  if (status === "confirmed") return "processing";
  if (status === "processing") return "ready_to_ship";
  if (status === "ready_to_ship") return "shipping";
  return null;
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function WarehousePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);

  const lowStockItems = useMemo(
    () => products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5),
    [products],
  );

  const fulfillmentOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "confirmed" ||
          order.status === "processing" ||
          order.status === "ready_to_ship",
      ),
    [orders],
  );

  useEffect(() => {
    async function fetchWarehouseData() {
      if (!isAuthenticated || user?.role !== "warehouse") {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const [summaryData, productData, orderData] = await Promise.all([
          warehouseService.getInventorySummary(),
          warehouseService.getProducts({ page: 1, limit: 50 }),
          staffOpsService.getOrders(1, 50),
        ]);

        setSummary(summaryData);
        setProducts(productData);
        setOrders(orderData);
      } catch {
        setError("Không thể tải dữ liệu kho. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    void fetchWarehouseData();
  }, [isAuthenticated, user?.role]);

  async function handleAdvanceOrder(order: StaffOrder) {
    const nextStatus = getWarehouseNextStatus(order.status);
    if (!nextStatus) {
      return;
    }

    setSavingOrderId(order.id);
    setError(null);
    try {
      await staffOpsService.updateOrderStatus(order.id, nextStatus);
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, status: nextStatus } : item,
        ),
      );
    } catch {
      setError("Kho cập nhật trạng thái đơn thất bại.");
    } finally {
      setSavingOrderId(null);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Đang tải dữ liệu kho hàng...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border p-6 text-center space-y-4">
          <h1 className="text-xl font-bold">Bạn chưa đăng nhập</h1>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "warehouse") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border p-6 text-center space-y-3">
          <h1 className="text-xl font-bold">Không có quyền truy cập</h1>
          <p className="text-sm text-muted-foreground">
            Trang này chỉ dành cho tài khoản kho hàng.
          </p>
          <Link href="/profile" className="text-sm font-medium underline">
            Quay lại thông tin cá nhân
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi nhanh tồn kho, mặt hàng sắp hết và sản phẩm cần nhập bổ sung.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Tổng sản phẩm
          </p>
          <p className="mt-2 text-2xl font-bold">
            {summary?.totalProducts ?? products.length}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Tồn kho tổng
          </p>
          <p className="mt-2 text-2xl font-bold">
            {summary?.totalStockQuantity ?? 0}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Sắp hết hàng
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {summary?.lowStockProducts ?? lowStockItems.length}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Hết hàng
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {summary?.outOfStockProducts ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="font-semibold">
            Danh sách tồn kho (50 sản phẩm mới nhất)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-right font-medium">Giá bán</th>
                <th className="px-4 py-3 text-right font-medium">Tồn kho</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => {
                const displayPrice = Number(item.salePrice ?? item.price ?? 0);
                const stockState =
                  item.stockQuantity <= 0
                    ? "Hết hàng"
                    : item.stockQuantity <= 5
                      ? "Sắp hết"
                      : "Ổn định";

                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.sku || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatPrice(displayPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {item.stockQuantity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          stockState === "Hết hàng"
                            ? "bg-rose-100 text-rose-700"
                            : stockState === "Sắp hết"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {stockState}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Chưa có dữ liệu sản phẩm kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-3">
          <h2 className="font-semibold">Điều phối đơn hàng cho kho</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Kho chỉ xử lý luồng: confirmed -&gt; processing -&gt; ready_to_ship
            -&gt; shipping
          </p>
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
                  Thao tác kho
                </th>
              </tr>
            </thead>
            <tbody>
              {fulfillmentOrders.map((order) => {
                const nextStatus = getWarehouseNextStatus(order.status);
                const responsibleRole = getResponsibleRole(order.status);

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
                    <td className="px-4 py-3">
                      {orderStatusLabel[order.status]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          responsibleRole === "warehouse"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {responsibleRole === "warehouse"
                          ? "Kho hàng"
                          : "Nhân viên"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!nextStatus || savingOrderId === order.id}
                        onClick={() => void handleAdvanceOrder(order)}
                        className="inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
                      >
                        {nextStatus
                          ? `Chuyển sang ${orderStatusLabel[nextStatus]}`
                          : "Không có thao tác"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {fulfillmentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Không có đơn hàng nào đang chờ kho xử lý.
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
