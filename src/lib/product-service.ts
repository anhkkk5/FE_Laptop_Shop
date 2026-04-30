import api from "./api";

export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  sku: string | null;
  stockQuantity: number;
  status: string;
  specs: Record<string, string> | null;
  isFeatured: boolean;
  viewCount: number;
  category: Category | null;
  brand: Brand | null;
  images: ProductImage[];
  createdAt: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productClientService = {
  async getProducts(
    params?: ProductQueryParams,
  ): Promise<PaginatedResult<Product>> {
    const res = await api.get("/products", { params });
    return res.data.data;
  },

  async getFeatured(): Promise<Product[]> {
    const res = await api.get("/products/featured");
    return res.data.data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await api.get(`/products/${slug}`);
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get("/categories");
    return res.data.data;
  },

  async getBrands(): Promise<Brand[]> {
    const res = await api.get("/brands");
    return res.data.data;
  },
};
