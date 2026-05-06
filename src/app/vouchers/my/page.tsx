"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, Tag, Clock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  couponService,
  type CouponCollectionItem,
  type CouponDiscountType,
  type Coupon,
} from "@/lib/coupon-service";
import { Button } from "@/components/ui/button";

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

export default function MyVouchersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CouponCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollection = useCallback(async () => {
    try {
      const data = await couponService.getMyCollection();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollection();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCollection]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Bạn chưa đăng nhập</h1>
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const usable = items.filter((i) => i.isUsable);
  const expired = items.filter((i) => !i.isUsable);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/vouchers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Mã đã lưu của tôi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {usable.length} mã có thể sử dụng
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Ticket className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Bạn chưa lưu mã giảm giá nào.
          </p>
          <Button onClick={() => router.push("/vouchers")}>
            Xem mã giảm giá
          </Button>
        </div>
      ) : (
        <>
          {usable.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Có thể sử dụng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {usable.map((item) => (
                  <VoucherCard
                    key={item.collectionId}
                    item={item}
                    onUse={() => router.push("/checkout")}
                  />
                ))}
              </div>
            </section>
          )}

          {expired.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Đã hết hạn / Không khả dụng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expired.map((item) => (
                  <VoucherCard key={item.collectionId} item={item} expired />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function VoucherCard({
  item,
  expired,
  onUse,
}: {
  item: CouponCollectionItem;
  expired?: boolean;
  onUse?: () => void;
}) {
  const c = item.coupon;

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-2 ${expired ? "opacity-60 bg-muted/30" : "hover:shadow-md transition-shadow"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-mono font-bold text-base tracking-wide">
            {c.code}
          </span>
          <p className="text-sm font-medium mt-0.5">{c.name}</p>
        </div>
        {!expired && onUse && (
          <Button size="sm" onClick={onUse}>
            Sử dụng
          </Button>
        )}
        {expired && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Hết hạn
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
          <Tag className="h-3 w-3" />
          {discountLabel(c.discountType, Number(c.discountValue), c)}
        </span>
        {Number(c.minOrderValue) > 0 && (
          <span className="bg-muted px-2 py-0.5 rounded">
            Đơn từ {formatPrice(Number(c.minOrderValue))}
          </span>
        )}
        {c.endAt && (
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
            <Clock className="h-3 w-3" />
            {new Date(c.endAt).toLocaleDateString("vi-VN")}
          </span>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Đã lưu: {new Date(item.collectedAt).toLocaleDateString("vi-VN")}
      </p>
    </div>
  );
}
