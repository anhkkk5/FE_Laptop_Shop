import type { Metadata } from "next";
import type { ReactNode } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface ProductMeta {
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  stockQuantity: number;
  brand: { name: string } | null;
  category: { name: string } | null;
  images: { url: string; isPrimary: boolean; alt: string | null }[];
}

async function fetchProduct(slug: string): Promise<ProductMeta | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? null) as ProductMeta | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return { title: "Sản phẩm không tồn tại" };
  }

  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];
  const desc =
    product.shortDescription ??
    (product.description ? product.description.slice(0, 160) : null) ??
    `Mua ${product.name} chính hãng giá tốt tại Smart Laptop Store`;

  const keywords = [
    product.name,
    product.brand?.name,
    product.category?.name,
    "laptop chính hãng",
    "mua laptop",
  ].filter(Boolean) as string[];

  return {
    title: product.name,
    description: desc,
    keywords,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: desc,
      url: `/products/${product.slug}`,
      type: "website",
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              width: 800,
              height: 600,
              alt: primaryImage.alt ?? product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

export default async function ProductSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.shortDescription ?? product.description ?? undefined,
        image: product.images.map((i) => i.url),
        sku: product.sku ?? undefined,
        brand: product.brand
          ? { "@type": "Brand", name: product.brand.name }
          : undefined,
        category: product.category?.name,
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          price: product.salePrice ?? product.price,
          availability:
            product.stockQuantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/products/${product.slug}`,
          priceValidUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString().split("T")[0],
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
