"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentService } from "@/lib/payment-service";

export default function VietQRPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Number(params.orderId);

  const [qrData, setQrData] = useState<{
    qrUrl: string;
    bankId: string;
    accountNo: string;
    amount: number;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");

  useEffect(() => {
    if (!orderId) return;
    paymentService
      .getVietQr(orderId)
      .then((data) => {
        setQrData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Lỗi tải QR");
        setLoading(false);
      });
  }, [orderId]);

  useEffect(() => {
    if (!orderId || status !== "pending") return;
    const interval = setInterval(async () => {
      try {
        const payment = await paymentService.getStatus(orderId);
        if (payment.status === "success") {
          setStatus("success");
          clearInterval(interval);
          setTimeout(() => router.push(`/payment/success?orderId=${orderId}`), 2000);
        } else if (payment.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
          setTimeout(() => router.push(`/payment/failed?orderId=${orderId}`), 2000);
        }
      } catch {
        /* ignore polling errors */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, status, router]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="mt-4 text-destructive">{error || "Không thể tải mã QR"}</p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          Xem đơn hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-xl font-bold">Quét mã VietQR để thanh toán</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Số tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(qrData.amount)}
      </p>

      <div className="mt-6 rounded-xl border bg-white p-4">
        <Image
          src={qrData.qrUrl}
          alt="VietQR"
          width={300}
          height={300}
          className="mx-auto"
          unoptimized
        />
        <p className="mt-3 text-xs text-muted-foreground">
          {qrData.bankId} - {qrData.accountNo}
        </p>
      </div>

      {status === "success" && (
        <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Thanh toán thành công! Đang chuyển hướng...</span>
        </div>
      )}
      {status === "failed" && (
        <div className="mt-6 flex items-center justify-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Thanh toán thất bại. Đang chuyển hướng...</span>
        </div>
      )}
      {status === "pending" && (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang chờ xác nhận thanh toán...
        </p>
      )}

      <Button variant="outline" className="mt-8" onClick={() => router.push(`/orders/${orderId}`)}>
        Xem chi tiết đơn hàng
      </Button>
    </div>
  );
}
