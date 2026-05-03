"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto max-w-md px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
      <h1 className="mt-6 text-2xl font-bold">Thanh toán thành công</h1>
      <p className="mt-2 text-muted-foreground">
        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng sớm nhất có thể.
      </p>
      {orderId && (
        <Button
          className="mt-8"
          onClick={() => router.push(`/orders/${orderId}`)}
        >
          Xem chi tiết đơn hàng
        </Button>
      )}
      <Button
        variant="outline"
        className="mt-3 block w-full"
        onClick={() => router.push("/products")}
      >
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
