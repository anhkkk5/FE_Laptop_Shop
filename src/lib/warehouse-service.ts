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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WarehouseProductsResult {
  items: WarehouseProduct[];
  meta: PaginationMeta;
}

export type StockMovementType =
  | "import"
  | "export"
  | "adjust"
  | "reserve"
  | "release"
  | "confirm";

export interface StockMovementRecord {
  id: number;
  productId: number;
  type: StockMovementType;
  quantity: number;
  beforeQty: number;
  afterQty: number;
  reason: string | null;
  createdBy: number | null;
  createdAt: string;
}

export interface StockMovementsResult {
  items: StockMovementRecord[];
  meta: PaginationMeta;
}

export interface StockActionPayload {
  productId: number;
  quantity: number;
  reason?: string;
}

export type AdjustTarget = "available" | "damaged" | "incoming";

export interface AdjustStockPayload extends StockActionPayload {
  target: AdjustTarget;
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

type StockMovementsApiPayload = {
  data?: StockMovementRecord[];
  meta?: RawPaginationMeta;
};

type RawPaginationMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
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

function extractRawMeta(payload: InventoryListApiPayload): RawPaginationMeta {
  if (Array.isArray(payload)) return {};
  if (!Array.isArray(payload?.data) && payload?.data?.meta) {
    return payload.data.meta;
  }
  if (payload?.meta) {
    return payload.meta;
  }

  return {
    total: payload?.total,
    page: payload?.page,
    limit: payload?.limit,
  };
}

function toPaginationMeta(
  payload: InventoryListApiPayload,
  defaultPage: number,
  defaultLimit: number,
  itemCount: number,
): PaginationMeta {
  const rawMeta = extractRawMeta(payload);
  const total = Number(rawMeta.total ?? itemCount);
  const page = Number(rawMeta.page ?? defaultPage);
  const limit = Number(rawMeta.limit ?? defaultLimit);
  const totalPages =
    Number(rawMeta.totalPages) || (limit > 0 ? Math.ceil(total / limit) : 1);

  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, totalPages),
  };
}

function toPaginationMetaFromRaw(
  rawMeta: RawPaginationMeta | undefined,
  defaultPage: number,
  defaultLimit: number,
  itemCount: number,
): PaginationMeta {
  const total = Number(rawMeta?.total ?? itemCount);
  const page = Number(rawMeta?.page ?? defaultPage);
  const limit = Number(rawMeta?.limit ?? defaultLimit);
  const totalPages =
    Number(rawMeta?.totalPages) || (limit > 0 ? Math.ceil(total / limit) : 1);

  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, totalPages),
  };
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
  }): Promise<WarehouseProductsResult> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.search) params.set("search", options.search);

    const qs = params.toString();
    const { data } = await api.get<InventoryListApiPayload>(
      `/inventory${qs ? `?${qs}` : ""}`,
    );
    const items = normalizeInventories(data).map(toWarehouseProduct);
    const meta = toPaginationMeta(
      data,
      options?.page ?? 1,
      options?.limit ?? 20,
      items.length,
    );

    return { items, meta };
  },

  async importStock(payload: StockActionPayload): Promise<void> {
    await api.post("/inventory/import", payload);
  },

  async exportStock(payload: StockActionPayload): Promise<void> {
    await api.post("/inventory/export", payload);
  },

  async adjustStock(payload: AdjustStockPayload): Promise<void> {
    await api.post("/inventory/adjust", payload);
  },

  async getMovements(
    productId: number,
    options?: {
      page?: number;
      limit?: number;
      movementType?: StockMovementType;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<StockMovementsResult> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.movementType) params.set("movementType", options.movementType);
    if (options?.fromDate) params.set("fromDate", options.fromDate);
    if (options?.toDate) params.set("toDate", options.toDate);

    const qs = params.toString();
    const { data } = await api.get<StockMovementsApiPayload>(
      `/inventory/${productId}/movements${qs ? `?${qs}` : ""}`,
    );

    const items = Array.isArray(data?.data) ? data.data : [];
    const meta = toPaginationMetaFromRaw(
      data?.meta,
      options?.page ?? 1,
      options?.limit ?? 10,
      items.length,
    );

    return { items, meta };
  },
};
