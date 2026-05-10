import type { MetadataRoute } from "next";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_URL}/products`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/vouchers`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/tracking`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_URL}/products?limit=1000&sortBy=updatedAt&sortOrder=DESC`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return staticRoutes;

    const json = await res.json();
    const products: Array<{ slug: string; updatedAt: string }> =
      json.data?.data ?? [];

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productUrls];
  } catch {
    return staticRoutes;
  }
}
