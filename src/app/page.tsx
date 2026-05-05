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
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  productClientService as productService,
  type Product,
  type Brand,
} from "@/lib/product-service";

/* ─────────── helpers ─────────── */
const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

/* ─────────── hero slides (static promo banners) ─────────── */
const heroSlides = [
  {
    id: 1,
    title: "SIÊU SALE CÔNG NGHỆ",
    subtitle:
      "Laptop văn phòng, gaming và phụ kiện chính hãng giảm sâu mỗi ngày",
    cta: "Mua ngay",
    badge: "Giá tốt hôm nay",
    bg: "from-[#0f172a] via-[#1e293b] to-[#334155]",
    text: "text-white",
  },
  {
    id: 2,
    title: "SETUP GỌN - NĂNG SUẤT CAO",
    subtitle: "Combo bàn phím, chuột, tai nghe tối ưu cho học tập và làm việc",
    cta: "Xem combo",
    badge: "Combo hot",
    bg: "from-[#0b3b5a] via-[#0f766e] to-[#14b8a6]",
    text: "text-white",
  },
  {
    id: 3,
    title: "TRẢ CHẬM 0% LINH HOẠT",
    subtitle: "Nhận máy ngay, chia nhỏ chi phí trong 3-12 tháng",
    cta: "Tìm hiểu",
    badge: "Trả góp",
    bg: "from-[#7c2d12] via-[#c2410c] to-[#ea580c]",
    text: "text-white",
  },
];

/* ─────────── brand chips ─────────── */
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

const quickPromoCards = [
  {
    title: "Deal dưới 15 triệu",
    desc: "Laptop học tập, văn phòng giá dễ mua",
    href: "/products?maxPrice=15000000",
    tone: "from-[#134e4a] to-[#0f766e]",
  },
  {
    title: "Gaming gear sale",
    desc: "Chuột, tai nghe, bàn phím ưu đãi theo tuần",
    href: "/products?category=phu-kien",
    tone: "from-[#7c2d12] to-[#ea580c]",
  },
];

const serviceHighlights = [
  {
    icon: ShieldCheck,
    title: "Bảo hành rõ ràng",
    desc: "Đổi mới trong 30 ngày với lỗi NSX",
  },
  {
    icon: Truck,
    title: "Giao nhanh toàn quốc",
    desc: "Hỏa tốc nội thành, theo dõi đơn minh bạch",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    desc: "Tư vấn cấu hình và hậu mãi xuyên suốt",
  },
  {
    icon: CreditCard,
    title: "Trả góp linh hoạt",
    desc: "Online 0% qua thẻ hoặc đơn vị tài chính",
  },
];

/* ─────────── countdown ─────────── */
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

/* ─────────── homepage ─────────── */
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFlashTab, setActiveFlashTab] = useState(flashTabs[0].label);

  /* embla hero */
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

  /* fetch featured products */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService
      .getProducts({ page: 1, limit: 8 })
      .then((res) => {
        if (!cancelled) setProducts(res.data.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* flash-sale countdown until end of today */
  const endOfDayMs = useMemo(() => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.getTime();
  }, []);
  const countdown = useCountdown(endOfDayMs);
  const topProducts = useMemo(() => products.slice(0, 8), [products]);
  const suggestProducts = useMemo(() => products.slice(4, 12), [products]);
  const flashProducts = useMemo(() => {
    if (products.length === 0) return [];
    const tabIndex = flashTabs.findIndex((tab) => tab.label === activeFlashTab);
    const start = Math.max(0, tabIndex) * 2;
    const byTab = products.slice(start, start + 4);
    return byTab.length > 0 ? byTab : products.slice(0, 4);
  }, [activeFlashTab, products]);

  return (
    <main className="flex-1 bg-[linear-gradient(180deg,#fffaf2_0%,#f8fafc_36%,#f8fafc_100%)] pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_22px_55px_-28px_rgba(15,23,42,0.42)]">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
                    <div
                      className={`relative flex h-[280px] flex-col justify-between overflow-hidden bg-gradient-to-br ${slide.bg} p-6 md:h-[338px] md:p-10 ${slide.text}`}
                    >
                      <div className="absolute right-[-24px] top-[-24px] h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                      <div className="absolute bottom-[-64px] right-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                      <div className="absolute -left-10 bottom-6 h-28 w-28 rounded-full border border-white/20" />
                      <div className="relative z-10 max-w-xl space-y-4">
                        <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                          {slide.badge}
                        </span>
                        <h1 className="text-3xl font-black leading-tight md:text-5xl">
                          {slide.title}
                        </h1>
                        <p className="max-w-md text-sm font-medium text-white/90 md:text-base">
                          {slide.subtitle}
                        </p>
                        <Link
                          href="/products"
                          className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:translate-y-[-1px] hover:bg-slate-100"
                        >
                          {slide.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === selectedIndex ? "w-7 bg-white" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quickPromoCards.map((card) => (
              <article
                key={card.title}
                className={`rounded-[24px] bg-gradient-to-br p-5 text-white shadow-[0_16px_38px_-30px_rgba(15,23,42,0.9)] ${card.tone}`}
              >
                <h3 className="text-base font-extrabold">{card.title}</h3>
                <p className="mt-1 text-xs text-white/85">{card.desc}</p>
                <Link
                  href={card.href}
                  className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  Khám phá
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {serviceHighlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-30px_rgba(15,23,42,0.9)]"
                >
                  <item.icon className="h-5 w-5 text-teal-700" />
                  <h3 className="mt-2 text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-[0_24px_45px_-32px_rgba(2,6,23,0.85)] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 fill-amber-300 text-amber-300" />
              <h2 className="text-base font-bold uppercase tracking-wide">
                Flash Deal Hôm Nay
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Clock className="h-4 w-4" />
              <span className="text-white/80">Kết thúc sau</span>
              {[countdown.h, countdown.m, countdown.s].map((num, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-white px-2 py-1 text-sm font-bold text-slate-900"
                >
                  {num.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {flashTabs.map((tab) => {
              const active = tab.label === activeFlashTab;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveFlashTab(tab.label)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-left text-xs font-semibold transition md:text-sm ${
                    active
                      ? "bg-white text-slate-900"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span className="block">{tab.label}</span>
                  <span className="mt-0.5 block text-[10px] font-medium opacity-80 md:text-[11px]">
                    {tab.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-24 animate-pulse rounded-2xl bg-white/10"
                />
              ))}
            </div>
          ) : flashProducts.length === 0 ? (
            <p className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-white/80">
              Chưa có sản phẩm trong nhóm flash deal.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {flashProducts.map((product) => (
                <Link
                  key={`flash-${product.id}`}
                  href={`/products/${product.slug}`}
                >
                  <article className="rounded-2xl border border-white/15 bg-white/10 p-3 transition hover:border-white/30 hover:bg-white/15">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-base font-black text-amber-300">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200/80 bg-white p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">
              Thương hiệu nổi bật
            </h2>
            <Link
              href="/products"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {brandChips.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 md:text-sm"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Sản phẩm nổi bật
              </h2>
              <p className="text-sm text-slate-500">
                Lựa chọn phổ biến trong ngày
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
            >
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              Chưa có sản phẩm hiển thị.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topProducts.map((product) => {
                const hasDiscount =
                  !!product.salePrice && product.salePrice < product.price;
                return (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.85)] transition hover:-translate-y-1 hover:shadow-[0_20px_35px_-25px_rgba(15,23,42,0.45)]">
                      {hasDiscount && (
                        <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          -
                          {Math.round(
                            (1 -
                              (product.salePrice as number) / product.price) *
                              100,
                          )}
                          %
                        </span>
                      )}

                      <div className="relative mb-3 flex h-44 items-center justify-center rounded-2xl bg-slate-50">
                        {product.images?.[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-contain p-3 transition duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="text-4xl font-black text-slate-200">
                            {product.brand?.name?.[0] ?? "P"}
                          </div>
                        )}
                      </div>

                      <h3 className="line-clamp-2 text-sm font-bold text-slate-900">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {product.specs
                          ? Object.values(product.specs).slice(0, 2).join(" • ")
                          : (product.shortDescription ?? "")}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                        <span className="ml-1 text-xs text-slate-500">
                          Đánh giá tốt
                        </span>
                      </div>

                      <div className="mt-auto pt-3">
                        <p className="text-lg font-black text-rose-600">
                          {formatPrice(product.salePrice ?? product.price)}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="rounded-3xl bg-gradient-to-br from-[#115e59] to-[#0f766e] p-6 text-white shadow-[0_24px_45px_-30px_rgba(8,47,73,0.9)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
              Ưu đãi theo tuần
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight">
              Build góc làm việc chuẩn công nghệ
            </h3>
            <p className="mt-2 text-sm text-cyan-50/90">
              Chuột + bàn phím + tai nghe giảm thêm đến 12% khi mua cùng laptop.
            </p>
            <Link
              href="/products?category=phu-kien"
              className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-cyan-700"
            >
              Khám phá phụ kiện
            </Link>
          </article>

          <article className="rounded-3xl bg-gradient-to-br from-[#9a3412] to-[#f97316] p-6 text-white shadow-[0_24px_45px_-30px_rgba(124,45,18,0.85)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-100">
              Dành cho sinh viên
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight">
              Laptop gọn nhẹ - pin lâu - trả chậm 0%
            </h3>
            <p className="mt-2 text-sm text-orange-50/90">
              Tặng balo + vệ sinh máy miễn phí trong năm đầu tiên.
            </p>
            <Link
              href="/products?category=laptop"
              className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-700"
            >
              Xem laptop phù hợp
            </Link>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_15px_30px_-26px_rgba(15,23,42,0.75)] md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900">Gợi ý cho bạn</h2>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : suggestProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Chưa có gợi ý phù hợp ở thời điểm này.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suggestProducts.map((product) => (
                <Link
                  key={`suggest-${product.id}`}
                  href={`/products/${product.slug}`}
                >
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-amber-200 hover:bg-white">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm font-bold text-amber-700">
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
