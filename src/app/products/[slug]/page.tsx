"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Eye } from "lucide-react";
import { productClientService, type Product } from "@/lib/product-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

const LOW_STOCK_THRESHOLD = 5;

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await productClientService.getBySlug(slug);
        setProduct(data);
      } catch {
        setError("Không tìm thấy sản phẩm hoặc đã có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      void fetchProduct();
    }
  }, [slug]);

  const images = useMemo(() => {
    if (!product?.images?.length) return [];
    const primaryIndex = product.images.findIndex((img) => img.isPrimary);
    if (primaryIndex <= 0) return product.images;

    const cloned = [...product.images];
    const [primary] = cloned.splice(primaryIndex, 1);
    return [primary, ...cloned];
  }, [product]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </Link>
        <div className="rounded-xl border bg-muted/20 p-12 text-center">
          <Package className="mx-auto h-14 w-14 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-semibold">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-muted-foreground mt-1">
            Vui lòng thử lại với sản phẩm khác.
          </p>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedImage]?.url;
  const isOutOfStock = product.stockQuantity <= 0;

  async function handleAddToCart() {
    if (!product) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setAdding(true);
    setActionMessage(null);

    try {
      await addToCart(product.id, 1);
      setActionMessage("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : "Không thể thêm vào giỏ hàng. Vui lòng thử lại.",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách sản phẩm
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-[4/3] rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-16 w-16 text-muted-foreground/30" />
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  className={`aspect-square overflow-hidden rounded-md border ${idx === selectedImage ? "border-primary ring-1 ring-primary" : "border-border"}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img.url}
                    alt={img.alt || product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {product.brand && (
                <Badge variant="secondary">{product.brand.name}</Badge>
              )}
              {product.category && (
                <Badge variant="outline">{product.category.name}</Badge>
              )}
              {product.isFeatured && <Badge>Nổi bật</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-muted-foreground">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="rounded-xl border p-4 bg-muted/20">
            {product.salePrice ? (
              <div className="space-y-1">
                <p className="text-3xl font-bold text-destructive">
                  {formatPrice(product.salePrice)}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </p>
              </div>
            ) : (
              <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Tồn kho</p>
              <p className="font-semibold">{product.stockQuantity}</p>
              {isOutOfStock ? (
                <p className="mt-1 text-xs font-medium text-destructive">
                  Sản phẩm hiện đã hết hàng
                </p>
              ) : product.stockQuantity <= LOW_STOCK_THRESHOLD ? (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Sắp hết hàng, hãy đặt sớm
                </p>
              ) : null}
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Lượt xem
              </p>
              <p className="font-semibold">{product.viewCount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
            >
              {isOutOfStock
                ? "Tạm hết hàng"
                : adding
                  ? "Đang thêm..."
                  : "Thêm vào giỏ hàng"}
            </Button>
            {actionMessage && (
              <p className="text-xs text-muted-foreground">{actionMessage}</p>
            )}
          </div>
        </div>
      </div>

      {product.description && (
        <section className="rounded-xl border p-5 space-y-2">
          <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {product.description}
          </p>
        </section>
      )}

      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="rounded-xl border p-5 space-y-3">
          <h2 className="text-lg font-semibold">Thông số kỹ thuật</h2>
          <div className="divide-y rounded-md border">
            {Object.entries(product.specs).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-3 gap-3 px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground col-span-1">{key}</span>
                <span className="col-span-2 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
