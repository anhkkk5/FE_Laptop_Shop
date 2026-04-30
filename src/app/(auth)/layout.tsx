import type { Metadata } from "next";
import Link from "next/link";
import { Laptop } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Xác thực",
    template: "%s | Smart Laptop Store",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left - Branding Panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-10 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/[0.03] blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
            <Laptop className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Smart Laptop Store
          </span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <blockquote className="space-y-4">
            <p className="text-3xl font-bold leading-tight tracking-tight">
              Trải nghiệm công nghệ
              <br />
              <span className="text-white/70">thông minh hơn.</span>
            </p>
            <p className="text-base text-white/50 max-w-md leading-relaxed">
              Khám phá bộ sưu tập laptop cao cấp, dịch vụ bảo hành chuyên
              nghiệp, và công cụ build PC thông minh — tất cả tại một nơi.
            </p>
          </blockquote>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-8 text-sm text-white/40">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white/80">500+</span>
            <span>Sản phẩm</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white/80">24/7</span>
            <span>Hỗ trợ</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white/80">12+</span>
            <span>Tháng bảo hành</span>
          </div>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="flex flex-col">
        {/* Mobile logo */}
        <div className="flex items-center justify-center p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Laptop className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Smart Laptop Store
            </span>
          </Link>
        </div>

        {/* Form content area */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
