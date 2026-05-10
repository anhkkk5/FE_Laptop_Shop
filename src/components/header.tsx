"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Laptop,
  Wrench,
  Cpu,
  Headphones,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import NotificationBell from "./notification-bell";
import { useAuth } from "@/context/auth-context";
import { useSiteSettings } from "@/context/site-setting-context";

const navCategories = [
  { href: "/products?category=laptop", label: "Laptop", icon: Laptop },
  { href: "/products?category=phu-kien", label: "Phụ kiện", icon: Headphones },
  { href: "/pc-build", label: "PC Builder", icon: Cpu },
  { href: "/vouchers", label: "Khuyến mãi", icon: Ticket },
  { href: "/warranty", label: "Bảo hành", icon: Wrench },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { logoUrl, logoText } = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-100 shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-6 gap-4 max-w-7xl">
        {/* Logo - left */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 flex-1">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoText || "Logo"}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Laptop className="h-5 w-5" />
            </div>
          )}
          <span className="hidden text-base font-bold text-gray-900 lg:inline">
            {logoText || "SMART LAPTOP"}
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Link>
          ))}
          {isAuthenticated && user?.role === "staff" && (
            <Link
              href="/staff"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Vận hành đơn
            </Link>
          )}
          {isAuthenticated && user?.role === "technician" && (
            <Link
              href="/technician"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Kỹ thuật
            </Link>
          )}
          {isAuthenticated && user?.role === "warehouse" && (
            <Link
              href="/warehouse"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Quản lý kho
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700">
            <NotificationBell />
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                title={user.fullName || "Tài khoản"}
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700 md:hidden"
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

      {/* Expandable search bar */}
      {searchOpen && (
        <div className="border-t border-brand-100 bg-brand-50/50">
          <div className="container mx-auto px-4 py-3">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Bạn tìm gì..."
                className="h-10 w-full rounded-lg border border-brand-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-500/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-brand-100 bg-white md:hidden">
          <div className="container mx-auto px-4 py-2 space-y-1">
            {/* Mobile search */}
            <div className="relative py-2">
              <input
                type="text"
                placeholder="Bạn tìm gì..."
                className="h-10 w-full rounded-lg border border-brand-200 bg-brand-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-500/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <hr className="border-brand-100 my-2" />
            {navCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === "staff" && (
              <Link
                href="/staff"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vận hành đơn
              </Link>
            )}
            {isAuthenticated && user?.role === "technician" && (
              <Link
                href="/technician"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kỹ thuật viên
              </Link>
            )}
            {isAuthenticated && user?.role === "warehouse" && (
              <Link
                href="/warehouse"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quản lý kho
              </Link>
            )}
            <hr className="border-brand-100 my-2" />
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Tài khoản của tôi
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
