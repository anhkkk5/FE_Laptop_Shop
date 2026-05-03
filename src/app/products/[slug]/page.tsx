"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Eye } from "lucide-react";
import { productClientService, type Product } from "@/lib/product-service";
import { orderService } from "@/lib/order-service";
import { reviewService, type Review } from "@/lib/review-service";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewMeta, setReviewMeta] = useState({ total: 0, averageRating: 0 });
  const [reviewOrderOptions, setReviewOrderOptions] = useState<
    Array<{ orderId: number; orderItemId: number; label: string }>
  >([]);
  const [selectedReviewOrderItem, setSelectedReviewOrderItem] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  async function loadReviews(productId: number) {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const result = await reviewService.getByProductId(productId, 1, 20);
      setReviews(result.data);
      setReviewMeta({
        total: result.meta.total,
        averageRating: result.meta.averageRating,
      });
    } catch {
      setReviewError("Không thể tải đánh giá sản phẩm");
    } finally {
      setReviewLoading(false);
    }
  }

  async function loadReviewOrderOptions(productId: number) {
    if (!isAuthenticated) {
      setReviewOrderOptions([]);
      return;
    }

    try {
      const orderResult = await orderService.getMine(1, 50);
      const options = orderResult.data
        .flatMap((order) =>
          order.items
            .filter((item) => item.productId === productId)
            .map((item) => ({
              orderId: order.id,
              orderItemId: item.id,
              label: `#${order.orderCode} - ${item.productName}`,
            })),
        )
        .filter(
          (item, index, array) =>
            array.findIndex(
              (entry) => entry.orderItemId === item.orderItemId,
            ) === index,
        );

      setReviewOrderOptions(options);
    } catch {
      setReviewOrderOptions([]);
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await productClientService.getBySlug(slug);
        setProduct(data);
        await Promise.all([
          loadReviews(data.id),
          isAuthenticated ? loadReviewOrderOptions(data.id) : Promise.resolve(),
        ]);
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

  async function handleSubmitReview() {
    if (!product) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!selectedReviewOrderItem) {
      setReviewMessage("Vui lòng chọn đơn hàng đã mua để đánh giá.");
      return;
    }

    const [orderIdText, orderItemIdText] = selectedReviewOrderItem.split(":");
    const orderId = Number(orderIdText);
    const orderItemId = Number(orderItemIdText);

    if (!orderId || !orderItemId) {
      setReviewMessage("Thông tin đơn hàng không hợp lệ.");
      return;
    }

    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      await reviewService.create({
        orderId,
        orderItemId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });

      setReviewComment("");
      setReviewRating(5);
      setSelectedReviewOrderItem("");
      setReviewMessage("Gửi đánh giá thành công.");

      await Promise.all([
        loadReviews(product.id),
        loadReviewOrderOptions(product.id),
      ]);
    } catch {
      setReviewMessage("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmittingReview(false);
    }
  }

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

      <section className="rounded-xl border p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Đánh giá sản phẩm</h2>
          <p className="text-sm text-muted-foreground">
            {reviewMeta.averageRating.toFixed(1)} / 5 ({reviewMeta.total} đánh
            giá)
          </p>
        </div>

        {isAuthenticated ? (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
            <p className="text-sm font-medium">Viết đánh giá</p>

            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedReviewOrderItem}
              onChange={(event) =>
                setSelectedReviewOrderItem(event.target.value)
              }
            >
              <option value="">-- Chọn đơn hàng đã mua --</option>
              {reviewOrderOptions.map((item) => (
                <option
                  key={`${item.orderId}-${item.orderItemId}`}
                  value={`${item.orderId}:${item.orderItemId}`}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Số sao:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`h-8 w-8 rounded-md border text-sm ${
                    reviewRating >= star
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  }`}
                  onClick={() => setReviewRating(star)}
                >
                  {star}
                </button>
              ))}
            </div>

            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
            />

            <Button onClick={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>

            {reviewMessage && (
              <p className="text-xs text-muted-foreground">{reviewMessage}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Vui lòng đăng nhập để gửi đánh giá sản phẩm.
          </p>
        )}

        {reviewLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải đánh giá...</p>
        ) : reviewError ? (
          <p className="text-sm text-destructive">{reviewError}</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {review.rating} / 5 sao
                    </p>
                    <span className="text-xs text-muted-foreground">★</span>
                  </div>
                  {review.isVerified && (
                    <Badge variant="outline">Đã mua hàng</Badge>
                  )}
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        className="h-20 w-20 rounded-md border object-cover"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
