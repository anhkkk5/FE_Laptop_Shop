"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orderService } from "@/lib/order-service";
import { warrantyService } from "@/lib/warranty-service";
import { notificationService } from "@/lib/notification-service";

const roleLabels: Record<string, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  technician: "Kỹ thuật viên",
  warehouse: "Kho hàng",
  admin: "Quản trị viên",
};

function getRoleLabel(role?: string): string {
  if (!role) return "Chưa xác định";
  return roleLabels[role] || role;
}

const internalRoles = new Set(["staff", "technician", "warehouse", "admin"]);

const orderStatusLabel: Record<string, string> = {
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

const warrantyStatusLabel: Record<string, string> = {
  pending: "Chờ tiếp nhận",
  received: "Đã tiếp nhận",
  diagnosing: "Đang chẩn đoán",
  repairing: "Đang sửa",
  waiting_parts: "Chờ linh kiện",
  completed: "Hoàn tất",
  returned: "Đã trả khách",
  rejected: "Từ chối",
};

function getPrimaryRouteByRole(role?: string): string {
  if (role === "staff") return "/staff";
  if (role === "technician") return "/technician";
  if (role === "warehouse") return "/warehouse";
  return "/orders";
}

function getPrimaryLabelByRole(role?: string): string {
  if (role === "staff") return "Vận hành đơn hàng";
  if (role === "technician") return "Khu vực kỹ thuật";
  if (role === "warehouse") return "Điều phối kho";
  return "Xem đơn hàng";
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [warrantyCount, setWarrantyCount] = useState(0);
  const [activeWarrantyCount, setActiveWarrantyCount] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [latestOrderStatus, setLatestOrderStatus] = useState<string | null>(
    null,
  );
  const [latestWarrantyStatus, setLatestWarrantyStatus] = useState<
    string | null
  >(null);

  const initials = useMemo(() => {
    if (!user?.fullName) return "U";
    const names = user.fullName.trim().split(" ").filter(Boolean);
    if (!names.length) return "U";
    if (names.length === 1) return names[0].slice(0, 1).toUpperCase();
    return `${names[0].slice(0, 1)}${names[names.length - 1].slice(0, 1)}`.toUpperCase();
  }, [user?.fullName]);

  useEffect(() => {
    async function loadSummary() {
      if (!isAuthenticated || !user) {
        setIsSummaryLoading(false);
        return;
      }

      setIsSummaryLoading(true);
      try {
        const [ordersRes, warrantyRes, unreadRes] = await Promise.all([
          orderService.getMine(1, 50),
          warrantyService.getMyTickets(1, 30),
          notificationService.getUnreadCount(),
        ]);

        const orders = ordersRes.data;
        const tickets = warrantyRes.data;

        setOrderCount(orders.length);
        setActiveOrderCount(
          orders.filter(
            (item) =>
              !["completed", "cancelled", "refunded"].includes(item.status),
          ).length,
        );
        setLatestOrderStatus(orders[0]?.status ?? null);

        setWarrantyCount(tickets.length);
        setActiveWarrantyCount(
          tickets.filter(
            (item) =>
              !["completed", "returned", "rejected"].includes(item.status),
          ).length,
        );
        setLatestWarrantyStatus(tickets[0]?.status ?? null);

        setNotificationUnread(unreadRes.unread);
      } catch {
        setOrderCount(0);
        setActiveOrderCount(0);
        setWarrantyCount(0);
        setActiveWarrantyCount(0);
        setNotificationUnread(0);
        setLatestOrderStatus(null);
        setLatestWarrantyStatus(null);
      } finally {
        setIsSummaryLoading(false);
      }
    }

    void loadSummary();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Đang tải thông tin tài khoản...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border p-6 text-center space-y-4">
          <h1 className="text-xl font-bold">Bạn chưa đăng nhập</h1>
          <p className="text-sm text-muted-foreground">
            Vui lòng đăng nhập để xem thông tin cá nhân và vị trí tài khoản.
          </p>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {user.role === "customer"
            ? "Bảng điều khiển khách hàng"
            : "Bảng điều khiển tài khoản"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user.role === "customer"
            ? "Theo dõi đơn hàng, bảo hành và thông báo trong một màn hình."
            : "Theo dõi nhiệm vụ chính theo vai trò nội bộ của bạn."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Đơn hàng
          </p>
          <p className="mt-1 text-2xl font-bold">
            {isSummaryLoading ? "..." : orderCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Đang xử lý: {isSummaryLoading ? "..." : activeOrderCount}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Ticket bảo hành
          </p>
          <p className="mt-1 text-2xl font-bold">
            {isSummaryLoading ? "..." : warrantyCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Đang mở: {isSummaryLoading ? "..." : activeWarrantyCount}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Thông báo chưa đọc
          </p>
          <p className="mt-1 text-2xl font-bold">
            {isSummaryLoading ? "..." : notificationUnread}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Đồng bộ theo tài khoản hiện tại
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Vai trò
          </p>
          <p className="mt-1 text-lg font-semibold">
            {getRoleLabel(user.role)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Trạng thái: {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
          </p>
        </div>
      </div>

      {user.role === "customer" ? (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Theo dõi trải nghiệm mua hàng
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Hành động nhanh theo flow mua hàng và hậu mãi.
              </p>
            </div>
            <Link
              href="/tracking"
              className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted/40"
            >
              Tra cứu vận đơn
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/orders"
              className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
            >
              <p className="font-medium">Đơn hàng của tôi</p>
              <p className="text-sm text-muted-foreground mt-1">
                {latestOrderStatus
                  ? `Đơn gần nhất: ${orderStatusLabel[latestOrderStatus] || latestOrderStatus}`
                  : "Chưa có đơn hàng"}
              </p>
            </Link>
            <Link
              href="/warranty"
              className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
            >
              <p className="font-medium">Bảo hành sản phẩm</p>
              <p className="text-sm text-muted-foreground mt-1">
                {latestWarrantyStatus
                  ? `Ticket gần nhất: ${warrantyStatusLabel[latestWarrantyStatus] || latestWarrantyStatus}`
                  : "Chưa có ticket"}
              </p>
            </Link>
            <Link
              href="/notifications"
              className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
            >
              <p className="font-medium">Thông báo</p>
              <p className="text-sm text-muted-foreground mt-1">
                {notificationUnread > 0
                  ? `${notificationUnread} thông báo chưa đọc`
                  : "Không có thông báo mới"}
              </p>
            </Link>
            <Link
              href="/products"
              className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
            >
              <p className="font-medium">Mua sắm tiếp</p>
              <p className="text-sm text-muted-foreground mt-1">
                Quay lại danh mục để đặt thêm sản phẩm
              </p>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Trung tâm tác nghiệp nội bộ</h2>
          <p className="text-sm text-muted-foreground">
            Tài khoản của bạn thuộc nhóm nội bộ. Truy cập nhanh khu vực làm việc
            theo vai trò.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={getPrimaryRouteByRole(user.role)}
              className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
            >
              {getPrimaryLabelByRole(user.role)}
            </Link>
            {internalRoles.has(user.role) && (
              <Link
                href="/notifications"
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
              >
                Xem thông báo vận hành
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border bg-card p-6 text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold">
              {user.fullName || "Chưa cập nhật"}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
            {getRoleLabel(user.role)}
          </span>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                user.isVerified
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-lime-100 text-lime-700"
              }`}
            >
              {user.isVerified ? "Đã xác minh email" : "Chưa xác minh email"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Chi tiết tài khoản</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Họ và tên
              </p>
              <p className="mt-1 font-medium">
                {user.fullName || "Chưa cập nhật"}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="mt-1 font-medium break-all">{user.email}</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Số điện thoại
              </p>
              <p className="mt-1 font-medium">
                {user.phone || "Chưa cập nhật"}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Vị trí / Vai trò
              </p>
              <p className="mt-1 font-medium">{getRoleLabel(user.role)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={getPrimaryRouteByRole(user.role)}
              className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
            >
              {getPrimaryLabelByRole(user.role)}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Tổng quan 5 roles</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mỗi role đại diện cho một phần nghiệp vụ thực tế và chỉ được phép thao
          tác đúng phạm vi backend.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">
                  Nghiệp vụ chính
                </th>
                <th className="px-3 py-2 text-left font-medium">
                  Quyền cốt lõi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium">Customer</td>
                <td className="px-3 py-2">Mua hàng, theo dõi đơn, bảo hành</td>
                <td className="px-3 py-2">
                  Cart, checkout, orders, warranty request
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium">Staff</td>
                <td className="px-3 py-2">Xử lý vận hành đơn</td>
                <td className="px-3 py-2">
                  Xem/cập nhật trạng thái đơn, kiểm tra thanh toán
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium">Technician</td>
                <td className="px-3 py-2">Hậu mãi, sửa chữa</td>
                <td className="px-3 py-2">
                  Nhận ticket, cập nhật diagnosing/repairing/completed
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium">Warehouse</td>
                <td className="px-3 py-2">Tồn kho và luân chuyển hàng</td>
                <td className="px-3 py-2">
                  Theo dõi tồn kho, import/export/adjust stock
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Admin</td>
                <td className="px-3 py-2">Quản trị hệ thống</td>
                <td className="px-3 py-2">
                  User/role, cấu hình, toàn bộ dashboard & báo cáo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
