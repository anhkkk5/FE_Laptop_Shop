import api from "./api";

export interface PcBuildComponent {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  specs: Record<string, string> | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface CompatibilityIssue {
  ruleId: number;
  severity: "error" | "warning";
  message: string;
  sourceProductId: number;
  targetProductId: number;
  sourceValue: string;
  targetValue: string;
}

export interface CompatibilityCheckResult {
  compatible: boolean;
  summary: {
    selectedCount: number;
    checkedRules: number;
    errorCount: number;
    warningCount: number;
  };
  issues: CompatibilityIssue[];
  selectedProducts: PcBuildComponent[];
}

export interface SuggestionItem {
  product: PcBuildComponent;
  compatible: boolean;
  compatibilityScore: number;
  errorCount: number;
  warningCount: number;
  issues: CompatibilityIssue[];
}

export interface SuggestComponentsResult {
  targetType: string;
  selectedCount: number;
  suggestions: SuggestionItem[];
}

export const pcBuildService = {
  async getComponentsByType(type: string, limit: number = 20) {
    const res = await api.get(`/pc-build/components/${type}`, {
      params: { limit },
    });
    return res.data.data as {
      type: string;
      data: PcBuildComponent[];
      meta: { total: number; limit: number };
    };
  },

  async checkCompatibility(componentIds: number[]) {
    const res = await api.post("/pc-build/check", { componentIds });
    return res.data.data as CompatibilityCheckResult;
  },

  async suggestComponents(params: {
    targetType: string;
    selectedComponentIds?: number[];
    limit?: number;
  }) {
    const res = await api.post("/pc-build/suggest", params);
    return res.data.data as SuggestComponentsResult;
  },
};
