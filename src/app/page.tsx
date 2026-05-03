"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Zap, Clock } from "lucide-react";
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
    title: "LỄ LỚN RỰC RỠ",
    subtitle: "Toàn bộ laptop Windows trả chậm 0%",
    cta: "MUA NGAY",
    bg: "bg-gradient-to-r from-red-600 to-orange-500",
    text: "text-white",
  },
  {
    id: 2,
    title: "NGÀN DEAL ĐUA NỞ",
    subtitle: "Giảm đến 50% phụ kiện laptop",
    cta: "XEM NGAY",
    bg: "bg-gradient-to-r from-yellow-400 to-amber-500",
    text: "text-[#0f172a]",
  },
  {
    id: 3,
    title: "LAPTOP HP SINH VIÊN",
    subtitle: "Chỉ từ 12.890.000đ - Trả góp 0%",
    cta: "KHÁM PHÁ",
    bg: "bg-gradient-to-r from-blue-600 to-cyan-500",
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

  return (
    <main className="flex-1 bg-[#f3f4f6]">
      {/* ═══════════ HERO CAROUSEL ═══════════ */}
      <section className="relative mx-auto max-w-6xl px-4 pt-4">
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex">
            {heroSlides.map((slide) => (
              <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
                <div
                  className={`flex h-56 items-center justify-between px-8 md:h-80 md:px-16 ${slide.bg} ${slide.text}`}
                >
                  <div className="max-w-md">
                    <h2 className="text-2xl font-extrabold md:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-sm font-medium md:text-lg">
                      {slide.subtitle}
                    </p>
                    <Link
                      href="/products"
                      className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[#0f172a] shadow-md hover:bg-gray-100"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                  {/* decorative laptop icon placeholder */}
                  <div className="hidden md:block">
                    <div className="h-32 w-32 rounded-2xl bg-white/20 backdrop-blur-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* carousel controls */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* dots */}
        <div className="mt-2 flex justify-center gap-1.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === selectedIndex ? "w-6 bg-[#0f172a]" : "w-2 bg-gray-400"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ FLASH SALE ═══════════ */}
      <section className="mx-auto mt-4 max-w-6xl px-4">
        <div className="rounded-xl bg-gradient-to-r from-red-600 to-rose-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 fill-yellow-300 text-yellow-300" />
              <span className="text-lg font-bold uppercase">Flash Sale</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Kết thúc trong:</span>
              <div className="flex gap-1">
                {[
                  countdown.h.toString().padStart(2, "0"),
                  countdown.m.toString().padStart(2, "0"),
                  countdown.s.toString().padStart(2, "0"),
                ].map((t, i) => (
                  <span
                    key={i}
                    className="inline-block rounded bg-white px-1.5 py-0.5 text-sm font-bold text-red-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BRAND CHIPS ═══════════ */}
      <section className="mx-auto mt-4 max-w-6xl px-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {brandChips.map((b) => (
            <Link
              key={b.id}
              href={`/products?brand=${b.slug}`}
              className="shrink-0 rounded-full border bg-white px-4 py-1.5 text-sm font-medium text-[#0f172a] shadow-sm hover:border-[#FFD400] hover:bg-[#FFD400]/10"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ PRODUCT GRID ═══════════ */}
      <section className="mx-auto mt-4 max-w-6xl px-4 pb-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f172a]">Sản phẩm nổi bật</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
            Chưa có sản phẩm nào
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`}>
                <article className="group relative flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
                  {/* discount badge */}
                  {p.salePrice && p.salePrice < p.price && (
                    <span className="absolute left-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      -{Math.round((1 - p.salePrice / p.price) * 100)}%
                    </span>
                  )}

                  {/* image */}
                  <div className="relative mb-2 flex h-40 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                    {p.images?.[0]?.url ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        className="object-contain p-2 transition group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="text-4xl font-bold text-gray-200">
                        {p.brand?.name?.[0] ?? "L"}
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <h3 className="line-clamp-2 text-sm font-semibold text-[#0f172a]">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                    {p.specs
                      ? Object.values(p.specs).slice(0, 2).join(" | ")
                      : (p.shortDescription ?? "")}
                  </p>

                  <div className="mt-auto pt-2">
                    <p className="text-base font-bold text-red-600">
                      {formatPrice(p.salePrice ?? p.price)}
                    </p>
                    {p.salePrice && p.salePrice < p.price && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(p.price)}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
