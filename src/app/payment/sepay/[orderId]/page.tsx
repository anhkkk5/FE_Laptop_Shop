"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Copy, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentService, type SepayQrData } from "@/lib/payment-service";

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

export default function SepayPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Number(params.orderId);

  const [qr, setQr] = useState<SepayQrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending",
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    paymentService
      .getSepayQr(orderId)
      .then((data) => {
        setQr(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không thể tải QR");
        setLoading(false);
      });
  }, [orderId]);

  // Poll trạng thái mỗi 5 giây
  useEffect(() => {
    if (!orderId || status !== "pending") return;
    const interval = setInterval(async () => {
      try {
        const payment = await paymentService.getStatus(orderId);
        if (payment.status === "success") {
          setStatus("success");
          clearInterval(interval);
          setTimeout(
            () => router.push(`/payment/success?orderId=${orderId}`),
            1500,
          );
        } else if (payment.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
          setTimeout(
            () => router.push(`/payment/failed?orderId=${orderId}`),
            1500,
          );
        }
      } catch {
        /* bỏ qua lỗi polling */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, status, router]);

  function copyCode() {
    if (!qr) return;
    void navigator.clipboard.writeText(qr.transferCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="mt-4 text-destructive">{error ?? "Không thể tải QR"}</p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          Xem đơn hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-10">
      <h1 className="text-center text-xl font-bold">Thanh toán chuyển khoản</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Quét mã QR hoặc chuyển khoản thủ công
      </p>

      {/* QR code */}
      <div className="mt-6 rounded-xl border bg-white p-5 text-center shadow-sm">
        <Image
          src={qr.qrUrl}
          alt="QR chuyển khoản"
          width={280}
          height={280}
          className="mx-auto"
          unoptimized
        />
      </div>

      {/* Thông tin chuyển khoản */}
      <div className="mt-4 rounded-xl border p-4 space-y-2.5 text-sm">
        <Row label="Ngân hàng" value={qr.bankCode} />
        <Row label="Số tài khoản" value={qr.accountNo} />
        <Row label="Chủ tài khoản" value={qr.accountName} />
        <Row label="Số tiền" value={fmt(qr.amount)} highlight />
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Nội dung CK</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-primary truncate">
              {qr.transferCode}
            </span>
            <button
              onClick={copyCode}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy nội dung"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-amber-600 font-medium">
        Nhập đúng nội dung <span className="font-mono">{qr.transferCode}</span>{" "}
        để hệ thống tự xác nhận
      </p>

      {/* Trạng thái */}
      <div className="mt-6 text-center">
        {status === "pending" && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang chờ xác nhận chuyển khoản...
          </p>
        )}
        {status === "success" && (
          <p className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
            <CheckCircle className="h-5 w-5" />
            Thanh toán thành công! Đang chuyển hướng...
          </p>
        )}
        {status === "failed" && (
          <p className="flex items-center justify-center gap-2 text-destructive font-medium">
            <XCircle className="h-5 w-5" />
            Thanh toán thất bại. Đang chuyển hướng...
          </p>
        )}
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full"
        onClick={() => router.push(`/orders/${orderId}`)}
      >
        Xem chi tiết đơn hàng
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-medium truncate ${highlight ? "text-primary text-base" : ""}`}>
        {value}
      </span>
    </div>
  );
}
