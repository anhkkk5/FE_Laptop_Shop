"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { orderService, type Order } from "@/lib/order-service";
import { paymentService, type Payment } from "@/lib/payment-service";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

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

const paymentStatusLabel: Record<string, string> = {
  pending: "Chờ thanh toán",
  success: "Đã thanh toán",
  failed: "Thanh toán thất bại",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const orderId = Number(params.id);

  useEffect(() => {
    async function fetchOrder() {
      if (!isAuthenticated || !orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await orderService.getMineById(orderId);
        setOrder(data);

        try {
          const paymentData = await paymentService.getStatus(orderId);
          setPayment(paymentData);
        } catch {
          setPayment(null);
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchOrder();
  }, [isAuthenticated, orderId]);

  const canCancel = useMemo(() => order?.status === "pending", [order?.status]);

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
        <p className="text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-4">
      <button
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/orders")}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách đơn hàng
      </button>

      <div className="rounded-xl border p-5 space-y-2">
        <h1 className="text-2xl font-bold">Đơn hàng #{order.orderCode}</h1>
        <p className="text-sm text-muted-foreground">
          Trạng thái: {statusLabel[order.status] || order.status}
        </p>
        <p className="text-sm text-muted-foreground">
          Ngày tạo: {new Date(order.createdAt).toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Sản phẩm</h2>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-muted-foreground">
                SL: {item.quantity} × {formatPrice(Number(item.unitPrice))}
              </p>
            </div>
            <p className="font-medium">{formatPrice(Number(item.lineTotal))}</p>
          </div>
        ))}
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-semibold">
            {formatPrice(Number(order.total))}
          </span>
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Thanh toán</h2>
          {payment && (
            <Button
              variant="outline"
              size="sm"
              disabled={checkingPayment}
              onClick={async () => {
                setCheckingPayment(true);
                try {
                  const paymentData = await paymentService.getStatus(order.id);
                  setPayment(paymentData);
                } finally {
                  setCheckingPayment(false);
                }
              }}
            >
              {checkingPayment ? "Đang kiểm tra..." : "Kiểm tra trạng thái"}
            </Button>
          )}
        </div>

        {payment ? (
          <>
            <p className="text-sm text-muted-foreground">
              Phương thức:{" "}
              <span className="font-medium text-foreground uppercase">
                {payment.method}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Trạng thái:{" "}
              <span className="font-medium text-foreground">
                {paymentStatusLabel[payment.status] || payment.status}
              </span>
            </p>
            {payment.transactionCode && (
              <p className="text-sm text-muted-foreground">
                Mã giao dịch:{" "}
                <span className="font-medium text-foreground">
                  {payment.transactionCode}
                </span>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có thông tin thanh toán.
          </p>
        )}
      </div>

      {canCancel && (
        <Button
          variant="destructive"
          disabled={cancelling}
          onClick={async () => {
            setCancelling(true);
            try {
              await orderService.cancel(order.id);
              const fresh = await orderService.getMineById(order.id);
              setOrder(fresh);
            } finally {
              setCancelling(false);
            }
          }}
        >
          {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
        </Button>
      )}
    </div>
  );
}
