"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Ticket, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import {
  couponService,
  type CouponValidationResult,
  type BestVoucherSuggestion,
} from "@/lib/coupon-service";
import { orderService } from "@/lib/order-service";
import { paymentService, type PaymentMethod } from "@/lib/payment-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CHECKOUT_COUPON_PREVIEW_KEY = "checkout_coupon_preview";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, isLoading: cartLoading, refreshCart } = useCart();

  const [form, setForm] = useState({
    customerName: user?.fullName || "",
    customerPhone: user?.phone || "",
    shippingAddress: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] =
    useState<CouponValidationResult | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [stockChanged, setStockChanged] = useState(false);
  const [suggestions, setSuggestions] = useState<BestVoucherSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const subtotal = useMemo(
    () => cart.summary.subtotal || 0,
    [cart.summary.subtotal],
  );
  const discountAmount = couponPreview?.discountAmount || 0;
  const isFreeShipping = couponPreview?.isFreeShipping || false;
  const payableTotal = Math.max(subtotal - discountAmount, 0);

  const fetchSuggestions = useCallback(async () => {
    try {
      const result = await couponService.getBestForCart();
      setSuggestions(result.suggestions);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && cart.items.length > 0) {
      fetchSuggestions();
    }
  }, [isAuthenticated, cart.items.length, fetchSuggestions]);

  async function handleApplyCoupon(code?: string) {
    const targetCode = (code || couponCode).trim().toUpperCase();
    if (!targetCode) {
      setCouponMessage("Vui lòng nhập mã giảm giá");
      setCouponPreview(null);
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage(null);
    setShowSuggestions(false);
    try {
      const validated = await couponService.validate(targetCode);
      setCouponCode(validated.code);
      setCouponPreview(validated);
      setCouponMessage("Áp mã thành công");
      window.localStorage.setItem(
        CHECKOUT_COUPON_PREVIEW_KEY,
        JSON.stringify(validated),
      );
    } catch (err) {
      setCouponPreview(null);
      setCouponMessage(
        err instanceof Error ? err.message : "Mã giảm giá không hợp lệ",
      );
      window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
    } finally {
      setApplyingCoupon(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Bạn chưa đăng nhập</h1>
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để thanh toán.
        </p>
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
        <p className="text-muted-foreground">
          Hãy thêm sản phẩm trước khi thanh toán.
        </p>
        <Button onClick={() => router.push("/products")}>Xem sản phẩm</Button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStockChanged(false);

    try {
      const order = await orderService.create({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        shippingAddress: form.shippingAddress,
        note: form.note || undefined,
        paymentMethod,
        couponCode: couponPreview?.code,
      });

      await paymentService.create(order.id, paymentMethod);

      if (paymentMethod === "cod") {
        window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
        router.push(`/payment/success?orderId=${order.id}`);
      } else if (paymentMethod === "vietqr") {
        window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
        router.push(`/payment/vietqr/${order.id}`);
      } else if (paymentMethod === "momo") {
        const momo = await paymentService.createMomo(order.id);
        if (momo.payUrl) {
          window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
          window.location.href = momo.payUrl;
        } else {
          router.push(`/payment/failed?orderId=${order.id}`);
        }
      } else {
        router.push(`/orders/${order.id}`);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể tạo đơn hàng";
      const isStockError = /stock|tồn kho|het hang|hết hàng/i.test(message);

      if (isStockError) {
        setStockChanged(true);
        setError(
          "Một số sản phẩm đã vượt tồn kho hiện tại. Vui lòng kiểm tra lại giỏ hàng.",
        );
        await refreshCart();
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 rounded-xl border p-5 space-y-4"
      >
        <h1 className="text-2xl font-bold">Thanh toán</h1>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {stockChanged && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            Số lượng sản phẩm trong giỏ đã được làm mới theo tồn kho mới nhất.
            Bạn có thể quay lại giỏ hàng để điều chỉnh trước khi đặt đơn.
          </div>
        )}

        <div className="space-y-2">
          <Label>Họ và tên</Label>
          <Input
            value={form.customerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerName: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Số điện thoại</Label>
          <Input
            value={form.customerPhone}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerPhone: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Địa chỉ nhận hàng</Label>
          <Textarea
            value={form.shippingAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, shippingAddress: e.target.value }))
            }
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

        <div className="space-y-2">
          <Label>Phương thức thanh toán</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`rounded-md border px-3 py-2 text-sm text-left ${
                paymentMethod === "cod"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              Thanh toán khi nhận hàng (COD)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("vietqr")}
              className={`rounded-md border px-3 py-2 text-sm text-left ${
                paymentMethod === "vietqr"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              VietQR (giả lập)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("momo")}
              className={`rounded-md border px-3 py-2 text-sm text-left ${
                paymentMethod === "momo"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              MoMo (giả lập)
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mã giảm giá</Label>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponPreview(null);
                setCouponMessage(null);
                window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
              }}
              placeholder="Nhập mã voucher"
            />
            <Button
              type="button"
              variant="outline"
              disabled={applyingCoupon}
              onClick={() => handleApplyCoupon()}
            >
              {applyingCoupon ? "Đang kiểm tra..." : "Áp dụng"}
            </Button>
          </div>
          {couponMessage && (
            <p
              className={`text-sm ${couponPreview ? "text-emerald-600" : "text-destructive"}`}
            >
              {couponMessage}
            </p>
          )}
          {isFreeShipping && (
            <p className="text-sm text-purple-600 font-medium">
              Miễn phí vận chuyển
            </p>
          )}
        </div>

        {suggestions.length > 0 && !couponPreview && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              {showSuggestions
                ? "Ẩn gợi ý"
                : `Xem ${suggestions.length} mã giảm giá phù hợp`}
            </button>
            {showSuggestions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => handleApplyCoupon(s.code)}
                    className="rounded-lg border p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm">
                        {s.code}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        -{formatPrice(s.discountAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {s.name}
                    </p>
                    {s.isFreeShipping && (
                      <span className="text-[10px] text-purple-600 font-medium">
                        + Miễn phí vận chuyển
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
        </Button>
        {stockChanged && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/cart")}
          >
            Quay lại giỏ hàng
          </Button>
        )}
      </form>

      <aside className="rounded-xl border p-5 h-fit space-y-3">
        <h2 className="font-semibold">Đơn hàng của bạn</h2>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-medium leading-snug">{item.productName}</p>
                <p className="text-muted-foreground">SL: {item.quantity}</p>
              </div>
              <p>{formatPrice(Number(item.unitPrice) * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-emerald-600">
          <span>Giảm giá</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-semibold text-lg">
            {formatPrice(payableTotal)}
          </span>
        </div>
      </aside>
    </div>
  );
}
