"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { orderService } from "@/lib/order-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();

  const [form, setForm] = useState({
    customerName: user?.fullName || "",
    customerPhone: user?.phone || "",
    shippingAddress: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cart.summary.subtotal || 0, [cart.summary.subtotal]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Bạn chưa đăng nhập</h1>
        <p className="text-muted-foreground">Vui lòng đăng nhập để thanh toán.</p>
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Giỏ hàng trống</h1>
        <p className="text-muted-foreground">Hãy thêm sản phẩm trước khi thanh toán.</p>
        <Button onClick={() => router.push("/products")}>Xem sản phẩm</Button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const order = await orderService.create({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        shippingAddress: form.shippingAddress,
        note: form.note || undefined,
        paymentMethod: "cod",
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-xl border p-5 space-y-4">
        <h1 className="text-2xl font-bold">Thanh toán</h1>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Họ và tên</Label>
          <Input
            value={form.customerName}
            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Số điện thoại</Label>
          <Input
            value={form.customerPhone}
            onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Địa chỉ nhận hàng</Label>
          <Textarea
            value={form.shippingAddress}
            onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Ghi chú</Label>
          <Textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={2}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Đang tạo đơn..." : "Xác nhận đặt hàng (COD)"}
        </Button>
      </form>

      <aside className="rounded-xl border p-5 h-fit space-y-3">
        <h2 className="font-semibold">Đơn hàng của bạn</h2>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium leading-snug">{item.productName}</p>
                <p className="text-muted-foreground">SL: {item.quantity}</p>
              </div>
              <p>{formatPrice(Number(item.unitPrice) * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
