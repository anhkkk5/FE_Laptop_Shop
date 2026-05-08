"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { returnService } from "@/lib/return-service";

const REASONS = [
  { value: "defective", label: "San pham bi loi / hong" },
  { value: "wrong_item", label: "Giao sai san pham" },
  { value: "not_as_described", label: "San pham khong dung mo ta" },
  { value: "no_longer_needed", label: "Khong con nhu cau" },
  { value: "better_price", label: "Tim thay gia tot hon" },
  { value: "other", label: "Ly do khac" },
];

function NewReturnForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const orderId = sp.get("orderId");
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) {
      setError("Thieu ma don hang");
      return;
    }
    if (!reason) {
      setError("Vui long chon ly do tra hang");
      return;
    }
    if (reason === "other" && desc.length < 10) {
      setError("Mo ta ly do toi thieu 10 ky tu");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await returnService.submit({
        orderId: Number(orderId),
        returnReason: reason,
        returnDescription: desc || undefined,
        evidencePhotos: photos.length > 0 ? photos : undefined,
      });
      router.push("/returns");
    } catch (x) {
      setError(x instanceof Error ? x.message : "Loi gui yeu cau");
    } finally {
      setSubmitting(false);
    }
  }

  function addPhoto() {
    const url = prompt("Nhap URL anh:");
    if (url && photos.length < 10) setPhotos([...photos, url]);
  }
  function removePhoto(idx: number) {
    setPhotos(photos.filter((_, i) => i !== idx));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lai
      </button>
      <div>
        <h1 className="text-2xl font-bold">Tao yeu cau tra hang</h1>
        <p className="text-muted-foreground">
          Don hang: {orderId || "Khong xac dinh"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ly do tra hang *</label>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${reason === r.value ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>
        </div>
        {reason === "other" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Mo ta chi tiet *</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Mo ta ly do tra hang..."
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Anh bang chung ({photos.length}/10)
          </label>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative h-20 w-20 rounded-lg border overflow-hidden"
              >
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.length < 10 && (
              <button
                type="button"
                onClick={addPhoto}
                className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed hover:border-primary/50"
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : (
            "Gui yeu cau tra hang"
          )}
        </button>
      </form>
    </div>
  );
}

export default function NewReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <NewReturnForm />
    </Suspense>
  );
}
