"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Eye } from "lucide-react";
import {
  productClientService,
  type Product,
  type ProductVariant,
} from "@/lib/product-service";
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

const SPEC_LABEL_MAP: Record<string, string> = {
  Hang: "Hãng",
  Bao_hanh: "Bảo hành",
  Xuat_xu: "Xuất xứ",
  Tinh_trang: "Tình trạng",
  Loai: "Loại",
  Tuong_thich: "Tương thích",
  Chat_lieu: "Chất liệu",
  Cong_suat_ho_tro: "Công suất hỗ trợ",
  Cong_ket_noi: "Cổng kết nối",
  Tinh_nang: "Tính năng",
  Luu_y: "Lưu ý",
};

const VIETNAMESE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bla\b/gi, "là"],
  [/\bsan pham\b/gi, "sản phẩm"],
  [/\bphu hop\b/gi, "phù hợp"],
  [/\bnhu cau\b/gi, "nhu cầu"],
  [/\bhoc tap\b/gi, "học tập"],
  [/\blam viec\b/gi, "làm việc"],
  [/\bgiai tri\b/gi, "giải trí"],
  [/\bhang ngay\b/gi, "hàng ngày"],
  [/\bThong tin noi bat\b/gi, "Thông tin nổi bật"],
  [/\bduoc\b/gi, "được"],
  [/\btoan bo\b/gi, "toàn bộ"],
  [/\bthong tin\b/gi, "thông tin"],
  [/\bky thuat\b/gi, "kỹ thuật"],
  [/\bday du\b/gi, "đầy đủ"],
  [/\bgiup\b/gi, "giúp"],
  [/\bde dang\b/gi, "dễ dàng"],
  [/\bso sanh\b/gi, "so sánh"],
  [/\blua chon\b/gi, "lựa chọn"],
  [/\bthuc te\b/gi, "thực tế"],
  [/\bChinh hang\b/g, "Chính hãng"],
  [/\bthang\b/gi, "tháng"],
  [/\bTrung Quoc\b/g, "Trung Quốc"],
  [/\bMoi 100%\b/g, "Mới 100%"],
  [/\bPhu kien laptop\b/gi, "Phụ kiện laptop"],
  [/\bDa thiet bi\b/gi, "Đa thiết bị"],
  [/\bNhua\/kim loai\b/gi, "Nhựa/kim loại"],
  [/\bneu co\b/gi, "nếu có"],
  [/\bTien loi\b/gi, "Tiện lợi"],
];

function formatSpecLabel(key: string): string {
  if (SPEC_LABEL_MAP[key]) return SPEC_LABEL_MAP[key];
  return key.replace(/_/g, " ");
}

function formatVietnameseText(value: string): string {
  return VIETNAMESE_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
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

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

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
  const activeVariants = product.variants?.filter((v) => v.isActive) ?? [];
  const hasVariants = activeVariants.length > 0;

  const displayPrice = selectedVariant
    ? (selectedVariant.salePrice ?? selectedVariant.price ?? product.price)
    : (product.salePrice ?? product.price);
  const displayOriginalPrice = selectedVariant?.price ?? product.price;
  const displaySalePrice = selectedVariant
    ? (selectedVariant.salePrice ?? selectedVariant.price ?? null)
    : product.salePrice;
  const displayStock = selectedVariant
    ? selectedVariant.stockQuantity
    : product.stockQuantity;
  const isOutOfStock = hasVariants
    ? (selectedVariant ? selectedVariant.stockQuantity <= 0 : false)
    : product.stockQuantity <= 0;
  const mustSelectVariant = hasVariants && !selectedVariant;

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

    if (mustSelectVariant) {
      setActionMessage("Vui lòng chọn phiên bản sản phẩm trước.");
      return;
    }

    setAdding(true);
    setActionMessage(null);

    try {
      await addToCart(product.id, 1, selectedVariant?.id);
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
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="space-y-3">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">Smart Laptop</Badge>
          {product.category && (
            <Badge variant="secondary">{product.category.name}</Badge>
          )}
          {product.brand && (
            <Badge variant="outline">{product.brand.name}</Badge>
          )}
          {product.isFeatured && <Badge>Nổi bật</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          <div className="aspect-[4/3] rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/20 p-3 shadow-sm">
            <div className="h-full w-full overflow-hidden rounded-xl bg-background flex items-center justify-center">
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
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {images.map((img, idx) => (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  className={`aspect-square overflow-hidden rounded-lg border bg-background ${
                    idx === selectedImage
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
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

        <div className="space-y-4 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-background p-5 shadow-sm space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold leading-tight lg:text-4xl">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {formatVietnameseText(product.shortDescription)}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              {displaySalePrice ? (
                <div className="space-y-1">
                  <p className="text-3xl font-black text-destructive">
                    {formatPrice(displaySalePrice)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through">
                      {formatPrice(displayOriginalPrice)}
                    </span>
                    <Badge variant="destructive">
                      -{Math.round((1 - displaySalePrice / displayOriginalPrice) * 100)}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-3xl font-black">
                  {formatPrice(displayPrice)}
                </p>
              )}
            </div>

            {/* Variant selector */}
            {hasVariants && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Phiên bản
                  {!selectedVariant && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      — chọn để tiếp tục
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        setSelectedVariant(
                          selectedVariant?.id === v.id ? null : v,
                        )
                      }
                      disabled={v.stockQuantity <= 0}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedVariant?.id === v.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : v.stockQuantity <= 0
                            ? "border-border bg-muted/40 text-muted-foreground line-through cursor-not-allowed"
                            : "border-border hover:border-primary/60 hover:bg-muted/30"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="text-xs text-muted-foreground">
                    Tồn kho phiên bản này:{" "}
                    <span className={`font-medium ${selectedVariant.stockQuantity <= LOW_STOCK_THRESHOLD ? "text-amber-600" : "text-emerald-700"}`}>
                      {selectedVariant.stockQuantity}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-muted-foreground">Tồn kho</p>
                <p className="text-lg font-semibold">{hasVariants && !selectedVariant ? "—" : displayStock}</p>
                {mustSelectVariant ? (
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Chọn phiên bản để xem
                  </p>
                ) : isOutOfStock ? (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    Sản phẩm hiện đã hết hàng
                  </p>
                ) : displayStock <= LOW_STOCK_THRESHOLD ? (
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    Sắp hết hàng, hãy đặt sớm
                  </p>
                ) : (
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    Còn hàng
                  </p>
                )}
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-1">
                <p className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Lượt xem
                </p>
                <p className="text-lg font-semibold">{product.viewCount}</p>
                <p className="text-xs text-muted-foreground">
                  {reviewMeta.averageRating.toFixed(1)} / 5 ({reviewMeta.total}{" "}
                  đánh giá)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={adding || isOutOfStock || mustSelectVariant}
              >
                {isOutOfStock
                  ? "Tạm hết hàng"
                  : mustSelectVariant
                    ? "Chọn phiên bản"
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
      </div>

      {product.description && (
        <section className="rounded-2xl border bg-background p-5 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {formatVietnameseText(product.description)}
          </p>
        </section>
      )}

      {product.specs && Object.keys(product.specs).length > 0 && (
        <section className="rounded-2xl border bg-background p-5 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Thông số kỹ thuật</h2>
          <div className="overflow-hidden rounded-xl border">
            {Object.entries(product.specs).map(([key, value], idx) => (
              <div
                key={key}
                className={`grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-3 sm:gap-3 ${
                  idx % 2 === 0 ? "bg-muted/10" : "bg-background"
                }`}
              >
                <span className="text-muted-foreground sm:col-span-1">
                  {formatSpecLabel(key)}
                </span>
                <span className="font-medium sm:col-span-2">
                  {formatVietnameseText(String(value))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-background p-5 shadow-sm space-y-4">
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
