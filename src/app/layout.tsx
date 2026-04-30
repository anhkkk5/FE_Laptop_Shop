import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Laptop Store",
    template: "%s | Smart Laptop Store",
  },
  description:
    "Cửa hàng laptop thông minh - Mua sắm laptop, linh kiện PC, dịch vụ bảo hành chuyên nghiệp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
