"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import {
  productClientService,
  type Product,
  type Category,
  type Brand,
  type PaginatedResult,
} from "@/lib/product-service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [result, setResult] = useState<PaginatedResult<Product>>({
    data: [],
    meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = Number(searchParams.get("page") || "1");
  const currentCategory = searchParams.get("categoryId") || "";
  const currentBrand = searchParams.get("brandId") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sortBy") || "createdAt";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage, limit: 12 };
      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.categoryId = Number(currentCategory);
      if (currentBrand) params.brandId = Number(currentBrand);
      if (currentSort) params.sortBy = currentSort;
      if (currentSort === "price") params.sortOrder = "ASC";

      const data = await productClientService.getProducts(params);
      setResult(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, currentCategory, currentBrand, currentSort]);

  const fetchMeta = useCallback(async () => {
    const [cats, brs] = await Promise.all([
      productClientService.getCategories(),
      productClientService.getBrands(),
    ]);
    setCategories(cats);
    setBrands(brs);
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    if (!updates.page) params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  function handleSearch() {
    updateParams({ search: searchInput, page: "1" });
  }

  const { data: products, meta } = result;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sản phẩm</h1>
        <p className="text-muted-foreground">
          Khám phá {meta.total} laptop chính hãng, giá tốt nhất
        </p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3 mb-6">
        <div className="flex flex-1 gap-2 max-w-lg">
          <Input
            placeholder="Tìm kiếm laptop..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} className="gap-2 shrink-0">
            <Search className="h-4 w-4" />
            Tìm
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-lg border bg-muted/30">
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={currentCategory}
            onChange={(e) => updateParams({ categoryId: e.target.value })}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={currentBrand}
            onChange={(e) => updateParams({ brandId: e.target.value })}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={currentSort}
            onChange={(e) => updateParams({ sortBy: e.target.value })}
          >
            <option value="createdAt">Mới nhất</option>
            <option value="price">Giá thấp → cao</option>
            <option value="viewCount">Xem nhiều nhất</option>
            <option value="name">Tên A → Z</option>
          </select>
        </div>
      )}

      {/* Active filters */}
      {(currentSearch || currentCategory || currentBrand) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {currentSearch && (
            <Badge variant="secondary" className="gap-1">
              Tìm: &quot;{currentSearch}&quot;
              <button onClick={() => updateParams({ search: "" })} className="ml-1">✕</button>
            </Badge>
          )}
          {currentCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => String(c.id) === currentCategory)?.name}
              <button onClick={() => updateParams({ categoryId: "" })} className="ml-1">✕</button>
            </Badge>
          )}
          {currentBrand && (
            <Badge variant="secondary" className="gap-1">
              {brands.find((b) => String(b.id) === currentBrand)?.name}
              <button onClick={() => updateParams({ brandId: "" })} className="ml-1">✕</button>
            </Badge>
          )}
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline"
            onClick={() => router.push("/products")}
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
          <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images.find((i) => i.isPrimary)?.url || product.images[0].url}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  {product.salePrice && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      -{Math.round((1 - product.salePrice / product.price) * 100)}%
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Nổi bật
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  {product.brand && (
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {product.brand.name}
                    </p>
                  )}
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.shortDescription}
                    </p>
                  )}
                  <div className="pt-1">
                    {product.salePrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-destructive">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button
            variant="outline"
            disabled={meta.page <= 1}
            onClick={() => updateParams({ page: String(meta.page - 1) })}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={meta.page >= meta.totalPages}
            onClick={() => updateParams({ page: String(meta.page + 1) })}
            className="gap-1"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
