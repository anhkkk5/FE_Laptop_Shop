import api from "./api";

export interface WarehouseProduct {
  id: number;
  name: string;
  sku: string | null;
  stockQuantity: number;
  price: number;
  salePrice: number | null;
  status: string;
  updatedAt?: string;
}

export interface InventorySummary {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockQuantity: number;
  lowStockThreshold: number;
}

type InventoryItem = {
  id: number;
  productId: number;
  availableQty: number;
  reservedQty: number;
  product?: {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    salePrice: number | null;
    status: string;
  };
};

type InventoryListApiPayload =
  | InventoryItem[]
  | {
      data?:
        | InventoryItem[]
        | {
            data?: InventoryItem[];
            meta?: {
              total?: number;
              page?: number;
              limit?: number;
            };
          };
      meta?: {
        total?: number;
        page?: number;
        limit?: number;
      };
      total?: number;
      page?: number;
      limit?: number;
    };

function normalizeInventories(
  payload: InventoryListApiPayload,
): InventoryItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (!Array.isArray(payload?.data) && Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }
  return [];
}

function toWarehouseProduct(item: InventoryItem): WarehouseProduct {
  return {
    id: item.product?.id ?? item.productId,
    name: item.product?.name ?? `Product #${item.productId}`,
    sku: item.product?.sku ?? null,
    stockQuantity: item.availableQty,
    price: Number(item.product?.price ?? 0),
    salePrice:
      item.product?.salePrice === null || item.product?.salePrice === undefined
        ? null
        : Number(item.product.salePrice),
    status: item.product?.status ?? "unknown",
  };
}

function toInventorySummary(
  inventoryItems: InventoryItem[],
  lowStockThreshold = 5,
): InventorySummary {
  let totalStockQuantity = 0;
  let outOfStockProducts = 0;
  let lowStockProducts = 0;

  for (const item of inventoryItems) {
    totalStockQuantity += item.availableQty;

    if (item.availableQty <= 0) {
      outOfStockProducts += 1;
      continue;
    }

    if (item.availableQty <= lowStockThreshold) {
      lowStockProducts += 1;
    }
  }

  return {
    totalProducts: inventoryItems.length,
    lowStockProducts,
    outOfStockProducts,
    totalStockQuantity,
    lowStockThreshold,
  };
}

export const warehouseService = {
  async getInventorySummary(): Promise<InventorySummary> {
    const { data } = await api.get<InventoryListApiPayload>(
      "/inventory?page=1&limit=500",
    );
    const items = normalizeInventories(data);
    return toInventorySummary(items);
  },

  async getProducts(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<WarehouseProduct[]> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.search) params.set("search", options.search);

    const qs = params.toString();
    const { data } = await api.get<InventoryListApiPayload>(
      `/inventory${qs ? `?${qs}` : ""}`,
    );

    return normalizeInventories(data).map(toWarehouseProduct);
  },
};
