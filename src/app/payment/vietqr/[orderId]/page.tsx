"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VietQRPage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/payment/sepay/${params.orderId}`);
  }, [router, params.orderId]);
  return null;
}
