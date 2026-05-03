"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentFailedInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto max-w-md px-4 py-16 text-center">
      <XCircle className="mx-auto h-16 w-16 text-destructive" />
      <h1 className="mt-6 text-2xl font-bold">Thanh toán thất bại</h1>
      <p className="mt-2 text-muted-foreground">
        Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc chọn
        phương thức khác.
      </p>
      {orderId && (
        <Button
          className="mt-8"
          onClick={() => router.push(`/orders/${orderId}`)}
        >
          Thử lại thanh toán
        </Button>
      )}
      <Button
        variant="outline"
        className="mt-3 block w-full"
        onClick={() => router.push("/orders")}
      >
        Xem đơn hàng
      </Button>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentFailedInner />
    </Suspense>
  );
}
