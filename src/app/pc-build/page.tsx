"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  pcBuildService,
  type CompatibilityCheckResult,
  type PcBuildComponent,
  type SuggestComponentsResult,
} from "@/lib/pc-build-service";

type BuilderType = {
  key: string;
  label: string;
};

const BUILDER_TYPES: BuilderType[] = [
  { key: "cpu", label: "CPU" },
  { key: "mainboard", label: "Mainboard" },
  { key: "ram", label: "RAM" },
  { key: "gpu", label: "GPU" },
  { key: "ssd", label: "SSD" },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function PcBuildPage() {
  const [componentsByType, setComponentsByType] = useState<
    Record<string, PcBuildComponent[]>
  >({});
  const [selectedByType, setSelectedByType] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] =
    useState<CompatibilityCheckResult | null>(null);
  const [suggestTargetType, setSuggestTargetType] = useState("gpu");
  const [suggestResult, setSuggestResult] =
    useState<SuggestComponentsResult | null>(null);

  const selectedIds = useMemo(
    () =>
      Object.values(selectedByType)
        .filter((id) => Number.isInteger(id) && id > 0)
        .map((id) => Number(id)),
    [selectedByType],
  );

  const selectedComponents = useMemo(
    () =>
      BUILDER_TYPES.map((item) => {
        const selectedId = selectedByType[item.key] || 0;
        const component =
          (componentsByType[item.key] || []).find(
            (value) => value.id === selectedId,
          ) || null;
        return {
          ...item,
          component,
        };
      }),
    [componentsByType, selectedByType],
  );

  const estimatedTotal = useMemo(
    () =>
      selectedComponents.reduce((sum, item) => {
        if (!item.component) return sum;
        return sum + (item.component.salePrice || item.component.price);
      }, 0),
    [selectedComponents],
  );

  async function loadComponents() {
    setLoading(true);
    setError(null);
    try {
      const entries = await Promise.all(
        BUILDER_TYPES.map(async (item) => {
          const response = await pcBuildService.getComponentsByType(
            item.key,
            20,
          );
          return [item.key, response.data] as const;
        }),
      );

      setComponentsByType(Object.fromEntries(entries));
    } catch {
      setError("Không thể tải danh sách linh kiện");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadComponents();
  }, []);

  async function handleCheckCompatibility() {
    if (selectedIds.length < 2) {
      setError("Vui lòng chọn ít nhất 2 linh kiện để kiểm tra");
      return;
    }

    setChecking(true);
    setError(null);
    try {
      const data = await pcBuildService.checkCompatibility(selectedIds);
      setCheckResult(data);
    } catch {
      setError("Không thể kiểm tra tương thích");
    } finally {
      setChecking(false);
    }
  }

  async function handleSuggest() {
    setSuggesting(true);
    setError(null);
    try {
      const data = await pcBuildService.suggestComponents({
        targetType: suggestTargetType,
        selectedComponentIds: selectedIds,
        limit: 6,
      });
      setSuggestResult(data);
    } catch {
      setError("Không thể gợi ý linh kiện");
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-200 via-lime-100 to-green-200 p-6 text-emerald-950 md:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-lime-300/40 blur-3xl" />

        <div className="relative space-y-3">
          <Badge className="border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700">
            SMART BUILD
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            PC Builder
          </h1>
          <p className="max-w-3xl text-sm text-emerald-900/90 md:text-base">
            Chọn linh kiện theo từng nhóm, kiểm tra tương thích ngay lập tức và
            nhận gợi ý tối ưu cho cấu hình trước khi mua.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs text-emerald-900">
            <span className="rounded-full border border-emerald-300 bg-white/60 px-3 py-1">
              Kiểm tra lỗi tương thích tự động
            </span>
            <span className="rounded-full border border-emerald-300 bg-white/60 px-3 py-1">
              Gợi ý linh kiện theo cấu hình hiện tại
            </span>
            <span className="rounded-full border border-emerald-300 bg-white/60 px-3 py-1">
              Theo dõi tồn kho real-time
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Đã chọn linh kiện</p>
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{selectedIds.length}/5</p>
        </div>

        <div className="rounded-xl border border-lime-100 bg-gradient-to-br from-lime-50 to-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tổng chi phí tạm tính
            </p>
            <Zap className="h-4 w-4 text-lime-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {formatPrice(estimatedTotal)}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trạng thái tương thích
            </p>
            {checkResult?.compatible ? (
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <p className="mt-2 text-base font-semibold">
            {checkResult
              ? checkResult.compatible
                ? "Cấu hình hiện tại ổn định"
                : "Có xung đột cần xử lý"
              : "Chưa kiểm tra"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border py-16">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BUILDER_TYPES.map((item) => {
            const list = componentsByType[item.key] || [];
            const selectedId = selectedByType[item.key] || 0;
            const selectedComponent = list.find(
              (component) => component.id === selectedId,
            );

            return (
              <div
                key={item.key}
                className="space-y-3 rounded-xl border border-emerald-100 bg-card p-4 transition-all hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{item.label}</p>
                  <Badge variant="secondary">{list.length} mẫu</Badge>
                </div>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedId}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setSelectedByType((prev) => ({
                      ...prev,
                      [item.key]: next,
                    }));
                  }}
                >
                  <option value={0}>-- Chọn {item.label} --</option>
                  {list.map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.name}
                    </option>
                  ))}
                </select>
                {selectedComponent ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 text-xs text-emerald-800">
                    <p className="line-clamp-1 font-medium text-foreground">
                      {selectedComponent.name}
                    </p>
                    <p className="mt-1">
                      Giá:{" "}
                      {formatPrice(
                        selectedComponent.salePrice || selectedComponent.price,
                      )}
                    </p>
                    <p className="mt-1">
                      Tồn kho: {selectedComponent.stockQuantity}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Chưa chọn linh kiện
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
        <Button
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleCheckCompatibility}
          disabled={checking || loading}
        >
          {checking ? "Đang kiểm tra..." : "Kiểm tra tương thích"}
        </Button>

        <select
          className="h-9 rounded-md border border-emerald-300 bg-white px-3 text-sm"
          value={suggestTargetType}
          onChange={(event) => setSuggestTargetType(event.target.value)}
          disabled={suggesting || loading}
        >
          {BUILDER_TYPES.map((item) => (
            <option key={item.key} value={item.key}>
              Gợi ý {item.label}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={handleSuggest}
          disabled={suggesting || loading}
        >
          {suggesting ? "Đang gợi ý..." : "Gợi ý linh kiện"}
        </Button>

        <Button
          variant="ghost"
          className="text-emerald-700 hover:bg-emerald-100"
          onClick={loadComponents}
          disabled={loading}
        >
          Làm mới danh sách
        </Button>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-card p-4">
        <p className="mb-3 text-sm font-medium">Linh kiện đã chọn</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {selectedComponents.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium">
                {item.component ? item.component.name : "Chưa chọn"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {checkResult && (
        <div className="space-y-3 rounded-xl border border-emerald-100 bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Kết quả tương thích</h2>
            <Badge variant={checkResult.compatible ? "default" : "destructive"}>
              {checkResult.compatible ? "Tương thích" : "Có xung đột"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Đã kiểm tra {checkResult.summary.selectedCount} linh kiện, phát hiện{" "}
            {checkResult.summary.errorCount} lỗi và{" "}
            {checkResult.summary.warningCount} cảnh báo.
          </p>

          {checkResult.issues.length > 0 ? (
            <ul className="space-y-2">
              {checkResult.issues.map((issue, index) => (
                <li
                  key={`${issue.ruleId}-${index}`}
                  className="rounded border p-2 text-sm"
                >
                  <span
                    className={
                      issue.severity === "error"
                        ? "text-destructive font-medium"
                        : "text-lime-700 font-medium"
                    }
                  >
                    {issue.severity === "error" ? "Lỗi" : "Cảnh báo"}:
                  </span>{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Không có cảnh báo nào.
            </p>
          )}
        </div>
      )}

      {suggestResult && (
        <div className="space-y-3 rounded-xl border border-emerald-100 bg-card p-4">
          <h2 className="text-lg font-semibold">
            Gợi ý {suggestResult.targetType.toUpperCase()}
          </h2>

          {suggestResult.suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có gợi ý phù hợp với cấu hình hiện tại.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {suggestResult.suggestions.map((item) => (
                <div
                  key={item.product.id}
                  className="space-y-1 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3"
                >
                  <p className="font-medium line-clamp-2">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.product.salePrice || item.product.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Điểm tương thích: {item.compatibilityScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lỗi: {item.errorCount}, Cảnh báo: {item.warningCount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
