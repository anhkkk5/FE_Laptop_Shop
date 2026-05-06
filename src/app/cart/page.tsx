"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  TicketPercent,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { type CouponValidationResult } from "@/lib/coupon-service";

const CHECKOUT_COUPON_PREVIEW_KEY = "checkout_coupon_preview";

function getCouponPreview(): CouponValidationResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CHECKOUT_COUPON_PREVIEW_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CouponValidationResult;
  } catch {
    window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
    return null;
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoading,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart,
  } = useCart();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponPreview, setCouponPreview] =
    useState<CouponValidationResult | null>(getCouponPreview);

  const subtotal = useMemo(
    () => cart.summary.subtotal || 0,
    [cart.summary.subtotal],
  );
  const hasValidPreview =
    couponPreview !== null && Number(couponPreview.subtotal) === subtotal;
  const discountAmount = hasValidPreview
    ? Number(couponPreview?.discountAmount || 0)
    : 0;
  const payableTotal = Math.max(subtotal - discountAmount, 0);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Bạn chưa đăng nhập</h1>
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để xem giỏ hàng.
        </p>
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Tiếp tục mua sắm
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Giỏ hàng</h1>
          <p className="text-sm text-muted-foreground">
            {cart.summary.totalItems} sản phẩm
          </p>
        </div>
        {cart.items.length > 0 && (
          <Button
            variant="outline"
            onClick={async () => {
              setClearing(true);
              try {
                await clearCart();
              } finally {
                setClearing(false);
              }
            }}
            disabled={clearing}
          >
            {clearing ? "Đang xóa..." : "Xóa toàn bộ"}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="rounded-xl border p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-semibold">Giỏ hàng trống</p>
          <p className="text-sm text-muted-foreground mb-4">
            Hãy thêm sản phẩm để bắt đầu.
          </p>
          <Button onClick={() => router.push("/products")}>Xem sản phẩm</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="rounded-xl border p-4 flex gap-4">
                <div className="h-24 w-24 rounded-md bg-muted overflow-hidden shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold leading-snug">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(Number(item.unitPrice))}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          if (item.quantity <= 1) return;
                          setUpdatingId(item.id);
                          setError(null);
                          try {
                            await updateCartItem(item.id, item.quantity - 1);
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : "Không thể cập nhật số lượng sản phẩm.",
                            );
                            await refreshCart();
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                        disabled={updatingId === item.id || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          setUpdatingId(item.id);
                          setError(null);
                          try {
                            await updateCartItem(item.id, item.quantity + 1);
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : "Số lượng vượt quá tồn kho hiện tại.",
                            );
                            await refreshCart();
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                        disabled={updatingId === item.id}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">
                        {formatPrice(Number(item.unitPrice) * item.quantity)}
                      </p>
                      <button
                        className="text-destructive hover:opacity-80"
                        onClick={async () => {
                          setUpdatingId(item.id);
                          try {
                            await removeCartItem(item.id);
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                        disabled={updatingId === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4 h-fit space-y-3">
            <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
            {couponPreview && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                <p className="inline-flex items-center gap-1 font-medium">
                  <TicketPercent className="h-3.5 w-3.5" />
                  Mã đã lưu: {couponPreview.code}
                </p>
                {!hasValidPreview && (
                  <p className="mt-1 text-amber-700">
                    Giỏ hàng đã thay đổi, cần áp lại mã ở bước thanh toán.
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-emerald-600">
              <span>Giảm giá dự kiến</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span>Liên hệ</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-semibold text-lg">
                {formatPrice(payableTotal)}
              </span>
            </div>
            {couponPreview && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  window.localStorage.removeItem(CHECKOUT_COUPON_PREVIEW_KEY);
                  setCouponPreview(null);
                }}
              >
                Bỏ mã đã lưu
              </Button>
            )}
            <Button className="w-full" onClick={() => router.push("/checkout")}>
              Tiến hành thanh toán
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
