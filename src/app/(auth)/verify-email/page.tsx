"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { authService } from "@/lib/auth-service";

import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "pending" | "verifying" | "success" | "error"
  >(token ? "verifying" : "pending");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const verify = useCallback(async (t: string) => {
    try {
      await authService.verifyEmail(t);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (token) {
      void verify(token);
    }
  }, [token, verify]);

  async function handleResend() {
    setResendLoading(true);
    setResendMessage(null);
    try {
      await authService.resendVerification();
      setResendMessage("Email xác thực đã được gửi lại!");
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : "Không thể gửi lại email",
      );
    } finally {
      setResendLoading(false);
    }
  }

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Đang xác thực email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Email đã xác thực!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tài khoản của bạn đã được xác thực thành công. Bạn có thể đăng
              nhập ngay bây giờ.
            </p>
          </div>
        </div>

        <Link href="/login">
          <Button className="w-full h-11 font-medium">Đăng nhập ngay</Button>
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Xác thực thất bại
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi
              lại email xác thực.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full h-11 font-medium"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gửi lại email xác thực
          </Button>
          {resendMessage && (
            <p className="text-center text-sm text-muted-foreground">
              {resendMessage}
            </p>
          )}
          <div className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: Pending state (after registration)
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-7 w-7 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Kiểm tra email của bạn
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Chúng tôi đã gửi email xác thực đến hộp thư của bạn. Vui lòng nhấn
            vào liên kết trong email để kích hoạt tài khoản.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
        <p className="text-sm font-medium">Không nhận được email?</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Kiểm tra thư mục Spam hoặc Quảng cáo</li>
          <li>• Đảm bảo bạn đã nhập đúng địa chỉ email</li>
          <li>• Chờ vài phút rồi thử lại</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-11 font-medium"
          onClick={handleResend}
          disabled={resendLoading}
        >
          {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gửi lại email xác thực
        </Button>
        {resendMessage && (
          <p className="text-center text-sm text-muted-foreground">
            {resendMessage}
          </p>
        )}
        <div className="flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Đang xử lý...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
