"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/context/auth-context";

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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const initials = useMemo(() => {
    if (!user?.fullName) return "U";
    const names = user.fullName.trim().split(" ").filter(Boolean);
    if (!names.length) return "U";
    if (names.length === 1) return names[0].slice(0, 1).toUpperCase();
    return `${names[0].slice(0, 1)}${names[names.length - 1].slice(0, 1)}`.toUpperCase();
  }, [user?.fullName]);

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
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem thông tin tài khoản và vị trí hiện tại của bạn trong hệ thống.
        </p>
      </div>

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
                  : "bg-amber-100 text-amber-700"
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
              href="/orders"
              className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
            >
              Xem đơn hàng
            </Link>
            {user.role === "staff" && (
              <Link
                href="/staff"
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
              >
                Vận hành đơn
              </Link>
            )}
            {user.role === "technician" && (
              <Link
                href="/technician"
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
              >
                Khu vực kỹ thuật
              </Link>
            )}
            {user.role === "warehouse" && (
              <Link
                href="/warehouse"
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted/40"
              >
                Quản lý kho
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
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
