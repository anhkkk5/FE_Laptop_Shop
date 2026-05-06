"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, Search, CheckCircle, Tag } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  couponService,
  type Coupon,
  type CouponDiscountType,
} from "@/lib/coupon-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function discountLabel(type: CouponDiscountType, value: number, coupon: Coupon) {
  switch (type) {
    case "percentage":
      return `Giảm ${value}%${coupon.maxDiscountAmount ? ` (tối đa ${formatPrice(Number(coupon.maxDiscountAmount))})` : ""}`;
    case "fixed_amount":
      return `Giảm ${formatPrice(value)}`;
    case "free_shipping":
      return "Miễn phí vận chuyển";
    case "buy_x_get_y":
      return `Mua ${coupon.buyQuantity ?? 2} tặng ${coupon.getQuantity ?? 1}`;
    default:
      return `Giảm ${value}`;
  }
}

function typeColor(type: CouponDiscountType) {
  switch (type) {
    case "percentage":
      return "bg-blue-100 text-blue-700";
    case "fixed_amount":
      return "bg-emerald-100 text-emerald-700";
    case "free_shipping":
      return "bg-purple-100 text-purple-700";
    case "buy_x_get_y":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function VouchersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [vouchers, setVouchers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    try {
      const data = await couponService.getActive();
      setVouchers(data);
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVouchers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchVouchers]);

  async function handleCollect(couponId: number) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setCollecting(couponId);
    setMessage(null);
    try {
      await couponService.collect(couponId);
      setVouchers((prev) =>
        prev.map((v) => (v.id === couponId ? { ...v, isCollected: true } : v)),
      );
      setMessage("Lưu mã thành công!");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Không thể lưu mã giảm giá",
      );
    } finally {
      setCollecting(null);
    }
  }

  const filtered = search.trim()
    ? vouchers.filter(
        (v) =>
          v.code.toLowerCase().includes(search.toLowerCase()) ||
          v.name.toLowerCase().includes(search.toLowerCase()),
      )
    : vouchers;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <Ticket className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Đăng nhập để xem khuyến mãi</h1>
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để xem và thu thập mã giảm giá.
        </p>
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Mã giảm giá
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thu thập mã và sử dụng khi thanh toán
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/vouchers/my")}
        >
          Mã đã lưu của tôi
        </Button>
      </div>

      {message && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm mã giảm giá..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Không có mã giảm giá nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-lg tracking-wide">
                      {v.code}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(v.discountType)}`}
                    >
                      {v.discountType === "percentage"
                        ? "%"
                        : v.discountType === "free_shipping"
                          ? "Ship"
                          : v.discountType === "buy_x_get_y"
                            ? "B+G"
                            : "₫"}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1">{v.name}</p>
                  {v.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {v.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {v.isCollected ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Đã lưu
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={collecting === v.id}
                      onClick={() => handleCollect(v.id)}
                    >
                      {collecting === v.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Thu thập"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                  <Tag className="h-3 w-3" />
                  {discountLabel(v.discountType, Number(v.discountValue), v)}
                </span>
                {Number(v.minOrderValue) > 0 && (
                  <span className="bg-muted px-2 py-0.5 rounded">
                    Đơn từ {formatPrice(Number(v.minOrderValue))}
                  </span>
                )}
                {v.endAt && (
                  <span className="bg-muted px-2 py-0.5 rounded">
                    HSD: {new Date(v.endAt).toLocaleDateString("vi-VN")}
                  </span>
                )}
                {v.usageLimit !== null && (
                  <span className="bg-muted px-2 py-0.5 rounded">
                    Còn {Math.max(Number(v.usageLimit) - Number(v.usageCount), 0)} lượt
                  </span>
                )}
                {v.firstTimeCustomerOnly && (
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    Khách mới
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
