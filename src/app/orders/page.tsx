"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orderService, type Order } from "@/lib/order-service";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

const statusLabel: Record<string, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await orderService.getMine(1, 20);
        setOrders(data.data);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để xem đơn hàng.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      {!orders.length ? (
        <div className="rounded-xl border p-8 text-center space-y-3">
          <p className="font-medium">Bạn chưa có đơn hàng nào</p>
          <div>
            <Link
              href="/products"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border p-4 hover:bg-muted/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">#{order.orderCode}</p>
                <span className="text-sm text-muted-foreground">
                  {statusLabel[order.status] || order.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <p className="font-semibold mt-2">
                {formatPrice(Number(order.total))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
