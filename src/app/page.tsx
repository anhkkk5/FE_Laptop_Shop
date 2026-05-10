"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  ShieldCheck,
  Truck,
  Headphones,
  CreditCard,
  Sparkles,
  Star,
  ArrowRight,
  ImageOff,
  Smartphone,
  Laptop,
  Watch,
  BatteryCharging,
  Briefcase,
  Home as HomeIcon,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  productClientService as productService,
  type Product,
  type Brand,
} from "@/lib/product-service";
import { bannerService, type Banner } from "@/lib/banner-service";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const brandChips: Brand[] = [
  { id: 1, name: "ASUS", slug: "asus" },
  { id: 2, name: "HP", slug: "hp" },
  { id: 3, name: "Dell", slug: "dell" },
  { id: 4, name: "Lenovo", slug: "lenovo" },
  { id: 5, name: "MacBook", slug: "macbook" },
  { id: 6, name: "Acer", slug: "acer" },
  { id: 7, name: "MSI", slug: "msi" },
  { id: 8, name: "GIGABYTE", slug: "gigabyte" },
];

const flashTabs = [
  { label: "Laptop", hint: "Hiệu năng ổn định" },
  { label: "Phụ kiện", hint: "Combo tiện dụng" },
  { label: "Màn hình", hint: "Hiển thị sắc nét" },
  { label: "Linh kiện", hint: "Nâng cấp dễ dàng" },
  { label: "Âm thanh", hint: "Giải trí đã tai" },
];

const featuredCategories = [
  { label: "Điện thoại", icon: Smartphone, href: "/products?category=dien-thoai" },
  { label: "Laptop", icon: Laptop, href: "/products?category=laptop" },
  { label: "Tai nghe", icon: Headphones, href: "/products?category=tai-nghe" },
  { label: "Đồng hồ", icon: Watch, href: "/products?category=dong-ho" },
  { label: "Cáp sạc", icon: BatteryCharging, href: "/products?category=cap-sac" },
  { label: "Túi xách", icon: Briefcase, href: "/products?category=tui-xach" },
  { label: "Mỹ phẩm", icon: Sparkles, href: "/products?category=my-pham" },
  { label: "Đồ gia dụng", icon: HomeIcon, href: "/products?category=gia-dung" },
];

const quickPromoCards = [
  {
    title: "Điện thoại chính hãng",
    desc: "Giảm đến 30%",
    href: "/products?category=dien-thoai",
    bg: "bg-orange-50 text-orange-900",
  },
  {
    title: "Laptop deal sốc",
    desc: "Giảm đến 40%",
    href: "/products?category=laptop",
    bg: "bg-blue-50 text-blue-900",
  },
  {
    title: "Phụ kiện giá tốt",
    desc: "Giảm đến 20%",
    href: "/products?category=phu-kien",
    bg: "bg-brand-50 text-brand-900",
  },
];

const serviceHighlights = [
  { icon: Truck, title: "Miễn phí vận chuyển", desc: "Cho đơn từ 500.000đ" },
  { icon: ShieldCheck, title: "Đổi trả dễ dàng", desc: "Trong vòng 7 ngày" },
  { icon: CreditCard, title: "Thanh toán an toàn", desc: "Bảo mật 100%" },
  { icon: Headphones, title: "Hỗ trợ 24/7", desc: "1900 1234" },
];

function useCountdown(targetTimeMs: number) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetTimeMs - Date.now());
      setLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const t = setInterval(tick, 1_000);
    return () => clearInterval(t);
  }, [targetTimeMs]);
  return left;
}

/* ── Banner slide ── */
function BannerSlide({ banner }: { banner: Banner }) {
  if (banner.imageUrl) {
    return (
      <div className="relative h-[260px] md:h-[360px] w-full overflow-hidden">
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          className="object-cover"
          priority
        />
        {(banner.title || banner.ctaText) && (
          <div className="absolute inset-0 bg-black/25 flex flex-col justify-end p-7 md:p-12">
            <div className="space-y-2 max-w-lg">
              {banner.title && (
                <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow">
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p className="text-sm text-white/90">{banner.subtitle}</p>
              )}
              {banner.ctaText && banner.ctaLink && (
                <Link
                  href={banner.ctaLink}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 transition"
                >
                  {banner.ctaText}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[300px] md:h-[400px] items-center justify-center bg-brand-50 flex-col gap-3">
      <ImageOff className="h-10 w-10 text-brand-400" />
      <p className="text-sm text-brand-600 font-medium">Chưa có ảnh — Admin upload từ trang quản trị</p>
    </div>
  );
}

/* ── Empty placeholder when no banners configured ── */
function EmptyBannerPlaceholder() {
  return (
    <div className="flex h-[300px] md:h-[400px] items-center justify-center bg-brand-50 border-2 border-dashed border-brand-200 rounded-2xl flex-col gap-3">
      <ImageOff className="h-12 w-12 text-brand-300" />
      <div className="text-center">
        <p className="text-base font-semibold text-brand-600">Chưa có banner</p>
        <p className="text-sm text-brand-500 mt-1">Admin vào trang quản trị để cấu hình banner</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFlashTab, setActiveFlashTab] = useState(flashTabs[0].label);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5_000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  useEffect(() => {
    bannerService
      .getActive()
      .then(setBanners)
      .catch(() => setBanners([]))
      .finally(() => setBannersLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    productService
      .getProducts({ page: 1, limit: 8 })
      .then((res) => { if (!cancelled) setProducts(res.data.slice(0, 8)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const endOfDayMs = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }, []);
  const countdown = useCountdown(endOfDayMs);

  const topProducts = useMemo(() => products.slice(0, 8), [products]);
  const suggestProducts = useMemo(() => products.slice(4, 8), [products]);
  const flashProducts = useMemo(() => {
    if (!products.length) return [];
    const idx = flashTabs.findIndex((t) => t.label === activeFlashTab);
    const start = Math.max(0, idx) * 2;
    const slice = products.slice(start, start + 4);
    return slice.length ? slice : products.slice(0, 4);
  }, [activeFlashTab, products]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] pb-16">
      
      {/* ── HERO BANNER ── */}
      <div className="bg-white pb-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-4">
          <div className="relative overflow-hidden rounded-2xl shadow-sm">
            {bannersLoading ? (
              <div className="h-[300px] md:h-[400px] animate-pulse bg-brand-100 rounded-2xl" />
            ) : banners.length === 0 ? (
              <EmptyBannerPlaceholder />
            ) : (
              <>
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {banners.map((banner) => (
                      <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                        <BannerSlide banner={banner} />
                      </div>
                    ))}
                  </div>
                </div>

                {banners.length > 1 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-gray-200 p-2 shadow-sm text-gray-700 hover:bg-white hover:text-brand transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border border-gray-200 p-2 shadow-sm text-gray-700 hover:bg-white hover:text-brand transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {banners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => emblaApi?.scrollTo(i)}
                          className={`h-2 rounded-full transition-all ${i === selectedIndex ? "w-6 bg-brand" : "w-2 bg-brand/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── SERVICE BAR ── */}
      <div className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
            {serviceHighlights.map((s) => (
              <div key={s.title} className="flex items-center justify-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <s.icon className="h-5 w-5 shrink-0 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* ── DANH MỤC NỔI BẬT (CATEGORY CIRCLES) ── */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 uppercase">Danh mục nổi bật</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {featuredCategories.map((cat) => (
              <Link key={cat.label} href={cat.href} className="group flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-100 group-hover:shadow-md group-hover:border-brand-200 transition-all duration-300 group-hover:-translate-y-1">
                  <cat.icon className="h-7 w-7 text-gray-600 group-hover:text-brand transition-colors" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── PROMO CARDS (UNDER CATEGORIES) ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickPromoCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <article className={`rounded-xl ${card.bg} p-6 flex flex-col justify-center h-full hover:-translate-y-1 transition duration-300 shadow-sm border border-black/5`}>
                <h3 className="font-bold text-lg">{card.title}</h3>
                <p className="mt-1 text-sm opacity-80">{card.desc}</p>
                <div className="mt-3 text-xs font-bold uppercase tracking-wide opacity-90 flex items-center gap-1">
                  Xem ngay <ArrowRight className="h-3 w-3" />
                </div>
              </article>
            </Link>
          ))}
        </section>

        {/* ── THƯƠNG HIỆU ── */}
        <section className="bg-white rounded-2xl border border-matcha-100 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Thương hiệu nổi bật</h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-matcha-700 uppercase tracking-wide hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandChips.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className="rounded-full border border-matcha-200 bg-matcha-50 px-4 py-1.5 text-sm font-semibold text-matcha-800 hover:border-matcha-400 hover:bg-matcha-100 transition"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── FLASH DEAL ── */}
        <section className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 fill-yellow-200 text-yellow-200" />
              <h2 className="text-base font-bold uppercase tracking-wide">Flash Deal Hôm Nay</h2>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 opacity-80" />
              <span className="text-white/80">Kết thúc sau</span>
              {[countdown.h, countdown.m, countdown.s].map((n, i) => (
                <span key={i} className="rounded-md bg-white px-2.5 py-1 text-sm font-bold text-red-600 tabular-nums">
                  {n.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            {flashTabs.map((tab) => {
              const active = tab.label === activeFlashTab;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveFlashTab(tab.label)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    active ? "bg-white text-red-600" : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-white/15" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {flashProducts.map((product) => (
                <Link key={`flash-${product.id}`} href={`/products/${product.slug}`}>
                  <article className="rounded-xl border border-white/20 bg-white/10 p-3 hover:bg-white/20 transition">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">{product.name}</h3>
                    <p className="mt-2 text-base font-black text-yellow-200">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── SẢN PHẨM BÁN CHẠY ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-end justify-between mb-5 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 uppercase">Sản phẩm bán chạy</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-50 border border-gray-100" />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-10 text-center text-gray-400">
              Chưa có sản phẩm hiển thị.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topProducts.map((product) => {
                const hasDiscount = !!product.salePrice && product.salePrice < product.price;
                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <article className="group flex flex-col h-full bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition duration-200">
                      <div className="relative aspect-square overflow-hidden bg-white p-2">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl font-black text-gray-200">
                            {product.brand?.name?.[0] ?? "P"}
                          </div>
                        )}
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 rounded-sm bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                            -{Math.round((1 - (product.salePrice as number) / product.price) * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 p-3.5 gap-1.5 border-t border-gray-50">
                        {product.brand && (
                          <p className="text-[11px] font-semibold text-brand uppercase tracking-wide">
                            {product.brand.name}
                          </p>
                        )}
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-brand transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-0.5 mt-auto pb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="ml-1.5 text-[11px] text-gray-400">(24)</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-red-600">
                            {formatPrice(product.salePrice ?? product.price)}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── PROMO BANNERS ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 p-7 text-white shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-100">
              Ưu đãi theo tuần
            </p>
            <h3 className="mt-2 text-2xl font-bold leading-tight">
              Build góc làm việc chuẩn công nghệ
            </h3>
            <p className="mt-2 text-sm text-white/85">
              Chuột + bàn phím + tai nghe giảm thêm đến 12% khi mua cùng laptop.
            </p>
            <Link
              href="/products?category=phu-kien"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand hover:bg-brand-50 transition"
            >
              Khám phá phụ kiện <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>

          <article className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 p-7 text-white shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-50">
              Dành cho sinh viên
            </p>
            <h3 className="mt-2 text-2xl font-bold leading-tight">
              Laptop gọn nhẹ · pin lâu · trả chậm 0%
            </h3>
            <p className="mt-2 text-sm text-white/85">
              Tặng balo + vệ sinh máy miễn phí trong năm đầu tiên.
            </p>
            <Link
              href="/products?category=laptop"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand hover:bg-brand-50 transition"
            >
              Xem laptop phù hợp <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        </section>

        {/* ── GỢI Ý ── */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-bold text-gray-900">Gợi ý cho bạn</h2>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-50" />
              ))}
            </div>
          ) : suggestProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có gợi ý phù hợp lúc này.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suggestProducts.map((product) => (
                <Link key={`suggest-${product.id}`} href={`/products/${product.slug}`}>
                  <article className="rounded-xl border border-gray-100 p-3 hover:border-brand-300 hover:shadow-sm transition">
                    <h3 className="line-clamp-2 text-sm font-medium text-gray-800">{product.name}</h3>
                    <p className="mt-2 text-sm font-bold text-red-600">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
