"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Package, MapPin, Clock, Truck } from "lucide-react";
import { shippingService, type TrackingResult } from "@/lib/shipping-service";

const LABELS: Record<string, string> = {
  pending: "Dang cho",
  created: "Da tao don",
  picked_up: "Da lay hang",
  in_transit: "Dang van chuyen",
  out_for_delivery: "Dang giao",
  delivered: "Da giao",
  delivery_failed: "Giao that bai",
  returning: "Dang hoan",
  returned: "Da hoan",
  cancelled: "Da huy",
};

function fmt(d: string) {
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrackingInner() {
  const sp = useSearchParams();
  const oid = sp.get("orderId");
  const [t, setT] = useState<TrackingResult | null>(null);
  const [l, setL] = useState(true);
  const [e, setE] = useState<string | null>(null);

  useEffect(() => {
    if (!oid) {
      setE("Thieu ma don hang");
      setL(false);
      return;
    }
    (async () => {
      try {
        setT(await shippingService.getTracking(Number(oid)));
      } catch (x) {
        setE(x instanceof Error ? x.message : "Loi");
      } finally {
        setL(false);
      }
    })();
  }, [oid]);

  if (l)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (e || !t)
    return (
      <div className="text-center py-20 space-y-3">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="font-bold text-xl">Khong tai duoc</p>
        <p className="text-muted-foreground">{e}</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theo doi don hang</h1>
        <p className="text-muted-foreground">
          Ma van don:{" "}
          <span className="font-mono font-bold">{t.trackingNumber}</span>
        </p>
      </div>
      <div className="rounded-xl border p-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Truck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-lg">
            {LABELS[t.status] || t.status}
          </p>
          {t.estimatedDelivery && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Du kien: {fmt(t.estimatedDelivery)}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="font-semibold">Lich su van chuyen</h2>
        {t.history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chua co cap nhat</p>
        ) : (
          <div className="space-y-0">
            {t.history.map((ev, i) => (
              <div key={ev.id || i} className="flex gap-3 pb-4 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full border-2 ${i === 0 ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"}`}
                  />
                  {i < t.history.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {LABELS[ev.status] || ev.status}
                  </p>
                  {ev.description && (
                    <p className="text-sm text-muted-foreground">
                      {ev.description}
                    </p>
                  )}
                  {ev.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {ev.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fmt(ev.eventTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <TrackingInner />
    </Suspense>
  );
}
