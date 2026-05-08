"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, ChevronRight } from "lucide-react";
import { returnService, type ReturnRequest } from "@/lib/return-service";

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Cho duyet",
  approved: "Da duyet",
  rejected: "Tu choi",
  label_generated: "Da tao nhan",
  in_transit: "Dang van chuyen",
  received_at_warehouse: "Da nhan hang",
  inspected: "Da kiem tra",
  refund_pending: "Cho hoan tien",
  refunded: "Da hoan tien",
  restocked: "Da nhap kho",
  cancelled: "Da huy",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-lime-100 text-lime-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-destructive/10 text-destructive",
  refunded: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function ReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await returnService.getMyReturns();
        setReturns(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (returns.length === 0)
    return (
      <div className="text-center py-20 space-y-3">
        <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="font-bold text-xl">Chua co yeu cau tra hang</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yeu cau tra hang</h1>
        <button
          onClick={() => router.push("/returns/new")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          Tao yeu cau moi
        </button>
      </div>
      <div className="space-y-3">
        {returns.map((r) => (
          <div
            key={r.id}
            onClick={() => router.push(`/returns/${r.id}`)}
            className="cursor-pointer rounded-xl border p-4 hover:border-primary/50 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.returnCode}</p>
                <p className="text-sm text-muted-foreground">
                  Don: {r.orderCode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-800"}`}
                >
                  {STATUS_LABELS[r.status] || r.status}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Ly do: {r.returnReason}</span>
              {r.refundAmount != null && (
                <span>Hoan: {r.refundAmount.toLocaleString()}d</span>
              )}
              <span>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
