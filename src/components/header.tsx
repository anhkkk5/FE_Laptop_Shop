"use client";

import Link from "next/link";
import { Laptop } from "lucide-react";
import NotificationBell from "./notification-bell";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Laptop className="h-5 w-5" />
          Smart Laptop Store
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/products"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Sản phẩm
          </Link>
          <Link
            href="/pc-build"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            PC Builder
          </Link>
          <Link
            href="/warranty"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Bảo hành
          </Link>
          <NotificationBell />
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          >
            Đăng nhập
          </Link>
        </nav>
      </div>
    </header>
  );
}
