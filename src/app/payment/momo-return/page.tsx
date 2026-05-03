"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function MomoReturnInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = Number(searchParams.get("orderId"));
  const resultCode = searchParams.get("resultCode");

  const [status, setStatus] = useState<"checking" | "success" | "failed">(
    "checking",
  );

  useEffect(() => {
    if (!orderId) return;
    if (resultCode === "0") {
      setStatus("success");
      setTimeout(
        () => router.push(`/payment/success?orderId=${orderId}`),
        2000,
      );
    } else {
      setStatus("failed");
      setTimeout(() => router.push(`/payment/failed?orderId=${orderId}`), 2000);
    }
  }, [orderId, resultCode, router]);

  return (
    <div className="container mx-auto max-w-md px-4 py-16 text-center">
      {status === "checking" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            Đang xác nhận kết quả thanh toán...
          </p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="mt-4 text-xl font-bold">Thanh toán thành công</h1>
          <p className="mt-2 text-muted-foreground">Đang chuyển hướng...</p>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Thanh toán thất bại</h1>
          <p className="mt-2 text-muted-foreground">Đang chuyển hướng...</p>
        </>
      )}
      <Button className="mt-8" onClick={() => router.push("/orders")}>
        Xem đơn hàng
      </Button>
    </div>
  );
}

export default function MomoReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MomoReturnInner />
    </Suspense>
  );
}
