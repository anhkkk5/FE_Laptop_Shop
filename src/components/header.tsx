"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  MapPin,
  Menu,
  X,
  Laptop,
  Wrench,
  Cpu,
  ChevronDown,
  Headphones,
} from "lucide-react";
import NotificationBell from "./notification-bell";
import { useAuth } from "@/context/auth-context";

const navCategories = [
  { href: "/products", label: "Laptop", icon: Laptop },
  { href: "/products?category=phu-kien", label: "Phụ kiện", icon: Headphones },
  { href: "/pc-build", label: "PC Builder", icon: Cpu },
  { href: "/warranty", label: "Bảo hành", icon: Wrench },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top yellow bar */}
      <div className="bg-[#FFD400]">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#0f172a] shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f172a] text-[#FFD400]">
              <Laptop className="h-5 w-5" />
            </div>
            <span className="hidden text-base font-bold sm:inline">
              SMART LAPTOP
            </span>
          </Link>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Bạn tìm gì..."
              className="h-9 w-full rounded-lg border-0 bg-white pl-9 pr-4 text-sm text-[#0f172a] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0f172a]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
            />
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/cart"
              className="relative flex flex-col items-center gap-0.5 text-[#0f172a]"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-[10px] font-medium hidden sm:inline">
                Giỏ hàng
              </span>
            </Link>

            <NotificationBell />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/orders"
                  className="flex flex-col items-center gap-0.5 text-[#0f172a]"
                >
                  <User className="h-5 w-5" />
                  <span className="text-[10px] font-medium hidden sm:inline">
                    {user.fullName?.split(" ").pop() || "Tài khoản"}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="flex flex-col items-center gap-0.5 text-[#0f172a]"
                  title="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center gap-0.5 text-[#0f172a]"
              >
                <User className="h-5 w-5" />
                <span className="text-[10px] font-medium hidden sm:inline">
                  Đăng nhập
                </span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden text-[#0f172a]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <nav className="bg-[#0f172a] text-white hidden sm:block">
        <div className="container mx-auto flex items-center gap-1 px-4">
          {navCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Link>
          ))}
          <Link
            href="/products"
            className="ml-auto flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Xem tất cả
            <ChevronDown className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="bg-[#0f172a] text-white sm:hidden">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {navCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex items-center gap-2 py-2 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Link>
            ))}
            <hr className="border-white/20 my-2" />
            <Link href="/login" className="block py-2 text-sm">
              Đăng nhập / Đăng ký
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
