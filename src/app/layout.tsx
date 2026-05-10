import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { SiteSettingProvider } from "@/context/site-setting-context";
import Header from "@/components/header";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const SITE_NAME = "Smart Laptop Store";
const DEFAULT_DESC =
  "Cửa hàng laptop chính hãng, uy tín. Đa dạng Dell, HP, Lenovo, Asus, Apple MacBook. Bảo hành chính hãng, giao hàng nhanh toàn quốc.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${SITE_NAME} - Laptop Chính Hãng Giá Tốt`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  keywords: [
    "laptop",
    "mua laptop",
    "laptop chính hãng",
    "laptop gaming",
    "macbook",
    "dell",
    "hp",
    "lenovo",
    "asus",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Laptop Chính Hãng Giá Tốt`,
    description: DEFAULT_DESC,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Laptop Chính Hãng Giá Tốt`,
    description: DEFAULT_DESC,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
          <CartProvider>
            <SiteSettingProvider>
              <Header />
              {children}
            </SiteSettingProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
