"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import {
  warehouseService,
  type AdjustTarget,
  type InventorySummary,
  type PaginationMeta,
  type StockMovementRecord,
  type StockMovementType,
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

const movementTypeLabel: Record<StockMovementType, string> = {
  import: "Nhập kho",
  export: "Xuất kho",
  adjust: "Điều chỉnh",
  reserve: "Giữ hàng",
  release: "Nhả giữ",
  confirm: "Xác nhận",
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

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN");
}

const PRODUCT_PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;
const MOVEMENT_PAGE_LIMIT = 10;

type WarehouseSection =
  | "overview"
  | "stock-action"
  | "movement-history"
  | "order-fulfillment";

export default function WarehousePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [productsMeta, setProductsMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: PRODUCT_PAGE_LIMIT,
    totalPages: 1,
  });
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [actionMode, setActionMode] = useState<"import" | "export" | "adjust">(
    "import",
  );
  const [actionProductId, setActionProductId] = useState("");
  const [actionQuantity, setActionQuantity] = useState("1");
  const [actionReason, setActionReason] = useState("");
  const [actionTarget, setActionTarget] = useState<AdjustTarget>("available");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [movementProductId, setMovementProductId] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState<
    "" | StockMovementType
  >("");
  const [movementFromDate, setMovementFromDate] = useState("");
  const [movementToDate, setMovementToDate] = useState("");
  const [movementPage, setMovementPage] = useState(1);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [movementsMeta, setMovementsMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: MOVEMENT_PAGE_LIMIT,
    totalPages: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] =
    useState<WarehouseSection>("overview");

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
    const timer = window.setTimeout(() => {
      setProductSearch(productSearchInput.trim());
      setProductPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [productSearchInput]);

  useEffect(() => {
    async function fetchWarehouseData() {
      if (!isAuthenticated || user?.role !== "warehouse") {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const [summaryData, orderData] = await Promise.all([
          warehouseService.getInventorySummary(),
          staffOpsService.getOrders(1, 50),
        ]);

        setSummary(summaryData);
        setOrders(orderData);
      } catch {
        setError("Không thể tải dữ liệu kho. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    void fetchWarehouseData();
  }, [isAuthenticated, refreshKey, user?.role]);

  useEffect(() => {
    async function fetchProductData() {
      if (!isAuthenticated || user?.role !== "warehouse") {
        setProductsLoading(false);
        return;
      }

      setProductsLoading(true);
      try {
        const productResult = await warehouseService.getProducts({
          page: productPage,
          limit: PRODUCT_PAGE_LIMIT,
          search: productSearch || undefined,
        });
        setProducts(productResult.items);
        setProductsMeta(productResult.meta);
      } catch {
        setError("Không thể tải danh sách tồn kho. Vui lòng thử lại.");
      } finally {
        setProductsLoading(false);
      }
    }

    void fetchProductData();
  }, [isAuthenticated, productPage, productSearch, refreshKey, user?.role]);

  useEffect(() => {
    if (products.length === 0) return;
    if (!actionProductId) {
      setActionProductId(String(products[0].id));
    }
    if (!movementProductId) {
      setMovementProductId(String(products[0].id));
    }
  }, [actionProductId, movementProductId, products]);

  useEffect(() => {
    async function fetchMovementData() {
      if (!isAuthenticated || user?.role !== "warehouse") {
        setMovementsLoading(false);
        return;
      }

      if (!movementProductId) {
        setMovements([]);
        setMovementsMeta({
          total: 0,
          page: 1,
          limit: MOVEMENT_PAGE_LIMIT,
          totalPages: 1,
        });
        setMovementsLoading(false);
        return;
      }

      setMovementsLoading(true);
      try {
        const result = await warehouseService.getMovements(
          Number(movementProductId),
          {
            page: movementPage,
            limit: MOVEMENT_PAGE_LIMIT,
            movementType: movementTypeFilter || undefined,
            fromDate: movementFromDate || undefined,
            toDate: movementToDate || undefined,
          },
        );
        setMovements(result.items);
        setMovementsMeta(result.meta);
      } catch {
        setError("Không thể tải lịch sử xuất nhập kho. Vui lòng thử lại.");
      } finally {
        setMovementsLoading(false);
      }
    }

    void fetchMovementData();
  }, [
    isAuthenticated,
    movementFromDate,
    movementPage,
    movementProductId,
    movementToDate,
    movementTypeFilter,
    refreshKey,
    user?.role,
  ]);

  async function handleStockActionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const productId = Number(actionProductId);
    const quantity = Number(actionQuantity);
    if (!productId || Number.isNaN(productId) || productId <= 0) {
      setError("Vui lòng nhập Product ID hợp lệ.");
      return;
    }
    if (Number.isNaN(quantity) || quantity === 0) {
      setError("Số lượng không hợp lệ.");
      return;
    }
    if ((actionMode === "import" || actionMode === "export") && quantity < 1) {
      setError("Nhập/Xuất kho yêu cầu số lượng >= 1.");
      return;
    }

    setActionSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (actionMode === "import") {
        await warehouseService.importStock({
          productId,
          quantity,
          reason: actionReason || undefined,
        });
        setSuccess("Nhập kho thành công.");
      } else if (actionMode === "export") {
        await warehouseService.exportStock({
          productId,
          quantity,
          reason: actionReason || undefined,
        });
        setSuccess("Xuất kho thành công.");
      } else {
        await warehouseService.adjustStock({
          productId,
          quantity,
          target: actionTarget,
          reason: actionReason || undefined,
        });
        setSuccess("Điều chỉnh tồn kho thành công.");
      }

      setMovementProductId(String(productId));
      setMovementPage(1);
      setRefreshKey((prev) => prev + 1);
      setActionReason("");
    } catch {
      setError("Thao tác kho thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setActionSubmitting(false);
    }
  }

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
          Tổng quan kho
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("stock-action")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "stock-action"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Nhập / Xuất / Điều chỉnh
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("movement-history")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "movement-history"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Lịch sử kho
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("order-fulfillment")}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            activeSection === "order-fulfillment"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          Điều phối đơn
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {activeSection === "overview" && (
        <>
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
              <p className="mt-2 text-2xl font-bold text-lime-600">
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-semibold">Danh sách tồn kho</h2>
                <input
                  type="search"
                  value={productSearchInput}
                  onChange={(event) =>
                    setProductSearchInput(event.target.value)
                  }
                  placeholder="Tìm theo tên hoặc SKU..."
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Hiển thị trang {productsMeta.page}/{productsMeta.totalPages} •
                Tổng {productsMeta.total} sản phẩm
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="px-4 py-3 text-left font-medium">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left font-medium">SKU</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Giá bán
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Tồn kho
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Đang tải danh sách tồn kho...
                      </td>
                    </tr>
                  )}
                  {products.map((item) => {
                    const displayPrice = Number(
                      item.salePrice ?? item.price ?? 0,
                    );
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
                                  ? "bg-lime-100 text-lime-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {stockState}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!productsLoading && products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        {productSearch
                          ? "Không tìm thấy sản phẩm phù hợp từ khóa."
                          : "Chưa có dữ liệu sản phẩm kho."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <button
                type="button"
                onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
                disabled={productsLoading || productsMeta.page <= 1}
                className="inline-flex h-8 items-center justify-center rounded-md border px-3 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
              >
                Trang trước
              </button>
              <span className="text-muted-foreground">
                Trang {productsMeta.page} / {productsMeta.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setProductPage((prev) =>
                    Math.min(productsMeta.totalPages, prev + 1),
                  )
                }
                disabled={
                  productsLoading ||
                  productsMeta.page >= productsMeta.totalPages
                }
                className="inline-flex h-8 items-center justify-center rounded-md border px-3 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
              >
                Trang sau
              </button>
            </div>
          </div>
        </>
      )}

      {activeSection === "stock-action" && (
        <div className="rounded-xl border p-4 space-y-4">
          <div>
            <h2 className="font-semibold">Nhập / Xuất / Điều chỉnh tồn kho</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhập Product ID và số lượng để thao tác nhanh tại kho.
            </p>
          </div>

          <form
            onSubmit={handleStockActionSubmit}
            className="grid gap-3 lg:grid-cols-6"
          >
            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs text-muted-foreground">
                Loại thao tác
              </label>
              <select
                value={actionMode}
                onChange={(event) =>
                  setActionMode(
                    event.target.value as "import" | "export" | "adjust",
                  )
                }
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              >
                <option value="import">Nhập kho</option>
                <option value="export">Xuất kho</option>
                <option value="adjust">Điều chỉnh</option>
              </select>
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs text-muted-foreground">
                Product ID
              </label>
              <input
                type="number"
                min={1}
                list="warehouse-product-options"
                value={actionProductId}
                onChange={(event) => setActionProductId(event.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                required
              />
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs text-muted-foreground">Số lượng</label>
              <input
                type="number"
                value={actionQuantity}
                min={actionMode === "adjust" ? undefined : 1}
                onChange={(event) => setActionQuantity(event.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                required
              />
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs text-muted-foreground">
                Mục điều chỉnh
              </label>
              <select
                value={actionTarget}
                onChange={(event) =>
                  setActionTarget(event.target.value as AdjustTarget)
                }
                disabled={actionMode !== "adjust"}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm disabled:opacity-50"
              >
                <option value="available">Available</option>
                <option value="incoming">Incoming</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs text-muted-foreground">Lý do</label>
              <input
                type="text"
                value={actionReason}
                onChange={(event) => setActionReason(event.target.value)}
                placeholder="Ví dụ: nhập lô hàng mới"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>

            <div className="lg:col-span-6 flex justify-end">
              <button
                type="submit"
                disabled={actionSubmitting}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionSubmitting ? "Đang xử lý..." : "Xác nhận thao tác kho"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSection === "movement-history" && (
        <div className="rounded-xl border overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold">Lịch sử nhập xuất kho</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-5">
              <input
                type="number"
                min={1}
                list="warehouse-product-options"
                value={movementProductId}
                onChange={(event) => {
                  setMovementProductId(event.target.value);
                  setMovementPage(1);
                }}
                placeholder="Product ID"
                className="h-9 rounded-md border bg-background px-3 text-sm"
              />
              <select
                value={movementTypeFilter}
                onChange={(event) => {
                  setMovementTypeFilter(
                    event.target.value as "" | StockMovementType,
                  );
                  setMovementPage(1);
                }}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="">Tất cả loại</option>
                {Object.entries(movementTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={movementFromDate}
                onChange={(event) => {
                  setMovementFromDate(event.target.value);
                  setMovementPage(1);
                }}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              />
              <input
                type="date"
                value={movementToDate}
                onChange={(event) => {
                  setMovementToDate(event.target.value);
                  setMovementPage(1);
                }}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted"
              >
                Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-4 py-3 text-left font-medium">Thời gian</th>
                  <th className="px-4 py-3 text-left font-medium">Loại</th>
                  <th className="px-4 py-3 text-right font-medium">
                    SL thay đổi
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Trước</th>
                  <th className="px-4 py-3 text-right font-medium">Sau</th>
                  <th className="px-4 py-3 text-left font-medium">Lý do</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Người tạo
                  </th>
                </tr>
              </thead>
              <tbody>
                {movementsLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Đang tải lịch sử kho...
                    </td>
                  </tr>
                )}
                {!movementsLoading &&
                  movements.map((movement) => (
                    <tr key={movement.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        {formatDateTime(movement.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {movementTypeLabel[movement.type]}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {movement.quantity > 0
                          ? `+${movement.quantity}`
                          : movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {movement.beforeQty}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {movement.afterQty}
                      </td>
                      <td className="px-4 py-3">{movement.reason || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {movement.createdBy ?? "—"}
                      </td>
                    </tr>
                  ))}
                {!movementsLoading && movements.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Không có dữ liệu lịch sử kho phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <button
              type="button"
              onClick={() => setMovementPage((prev) => Math.max(1, prev - 1))}
              disabled={movementsLoading || movementsMeta.page <= 1}
              className="inline-flex h-8 items-center justify-center rounded-md border px-3 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
            >
              Trang trước
            </button>
            <span className="text-muted-foreground">
              Trang {movementsMeta.page} / {movementsMeta.totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setMovementPage((prev) =>
                  Math.min(movementsMeta.totalPages, prev + 1),
                )
              }
              disabled={
                movementsLoading ||
                movementsMeta.page >= movementsMeta.totalPages
              }
              className="inline-flex h-8 items-center justify-center rounded-md border px-3 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {activeSection === "order-fulfillment" && (
        <div className="rounded-xl border overflow-hidden">
          <div className="border-b bg-muted/30 px-4 py-3">
            <h2 className="font-semibold">Điều phối đơn hàng cho kho</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Kho chỉ xử lý luồng: confirmed -&gt; processing -&gt;
              ready_to_ship -&gt; shipping
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Trạng thái
                  </th>
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
      )}

      <datalist id="warehouse-product-options">
        {products.map((item) => (
          <option key={item.id} value={item.id}>
            {`${item.name} (${item.sku || "No SKU"})`}
          </option>
        ))}
      </datalist>
    </div>
  );
}
