"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Package, MapPin, Clock, Truck, CheckCircle2, XCircle, AlertTriangle, CreditCard, Store } from "lucide-react";
import { returnService, type ReturnRequest } from "@/lib/return-service";

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Cho duyet", approved: "Da duyet", rejected: "Tu choi",
  label_generated: "Da tao nhan", in_transit: "Dang van chuyen",
  received_at_warehouse: "Da nhan hang", inspected: "Da kiem tra",
  refund_pending: "Cho hoan tien", refunded: "Da hoan tien",
  restocked: "Da nhap kho", cancelled: "Da huy",
};

const REASON_LABELS: Record<string, string> = {
  defective: "San pham loi", wrong_item: "Sai san pham",
  not_as_described: "Khong dung mo ta", no_longer_needed: "Khong can nua",
  better_price: "Gia tot hon", other: "Khac",
};

function fmt(d: string) { return new Date(d).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }); }

export default function ReturnDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [r, setR] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setR(await returnService.getById(Number(id))); } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!r) return <div className="text-center py-20"><p className="text-xl font-bold">Khong tim thay</p></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Quay lai</button>
      <div><h1 className="text-2xl font-bold">{r.returnCode}</h1><p className="text-muted-foreground">Don hang: {r.orderCode}</p></div>
      <div className="rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-3"><Package className="h-5 w-5 text-primary" /><span className="font-medium">Trang thai: {STATUS_LABELS[r.status] || r.status}</span></div>
        <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-yellow-600" /><span className="font-medium">Ly do: {REASON_LABELS[r.returnReason] || r.returnReason}</span></div>
        {r.returnDescription && <p className="text-sm text-muted-foreground pl-8">{r.returnDescription}</p>}
        {r.trackingNumber && <div className="flex items-center gap-3"><Truck className="h-5 w-5 text-blue-600" /><span>Ma van don: <span className="font-mono font-bold">{r.trackingNumber}</span></span></div>}
        {r.refundAmount != null && <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-green-600" /><span className="font-bold text-green-600">Hoan tien: {r.refundAmount.toLocaleString()}d</span></div>}
        {r.rejectionReason && <div className="flex items-start gap-3"><XCircle className="h-5 w-5 text-red-600 mt-0.5" /><div><p className="font-medium text-red-600">Bi tu choi</p><p className="text-sm text-muted-foreground">{r.rejectionReason}</p></div></div>}
      </div>
      {r.items && r.items.length > 0 && (
        <div className="space-y-3"><h2 className="font-semibold">San pham tra lai</h2>
          {r.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
              {item.productImage && <img src={item.productImage} alt={item.productName} className="h-16 w-16 rounded-md object-cover" />}
              <div className="flex-1 min-w-0"><p className="font-medium truncate">{item.productName}</p><p className="text-sm text-muted-foreground">SL: {item.quantity} x {item.unitPrice.toLocaleString()}d</p></div>
              <p className="font-semibold">{item.lineTotal.toLocaleString()}d</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Tao luc: {fmt(r.createdAt)}</p>
    </div>
  );
}
