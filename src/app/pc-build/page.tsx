"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
  const [selectedByType, setSelectedByType] = useState<Record<string, number>>({});
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

  async function loadComponents() {
    setLoading(true);
    setError(null);
    try {
      const entries = await Promise.all(
        BUILDER_TYPES.map(async (item) => {
          const response = await pcBuildService.getComponentsByType(item.key, 20);
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">PC Builder</h1>
        <p className="text-muted-foreground">
          Chọn linh kiện và kiểm tra tương thích cấu hình trước khi mua.
        </p>
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

            return (
              <div key={item.key} className="rounded-lg border p-4 space-y-3">
                <p className="font-medium">{item.label}</p>
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
                {selectedId > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {
                      list.find((component) => component.id === selectedId)?.stockQuantity
                    }{" "}
                    sản phẩm còn hàng
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCheckCompatibility} disabled={checking || loading}>
          {checking ? "Đang kiểm tra..." : "Kiểm tra tương thích"}
        </Button>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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
          onClick={handleSuggest}
          disabled={suggesting || loading}
        >
          {suggesting ? "Đang gợi ý..." : "Gợi ý linh kiện"}
        </Button>

        <Button variant="ghost" onClick={loadComponents} disabled={loading}>
          Làm mới danh sách
        </Button>
      </div>

      {checkResult && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Kết quả tương thích</h2>
            <Badge variant={checkResult.compatible ? "default" : "destructive"}>
              {checkResult.compatible ? "Tương thích" : "Có xung đột"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Đã kiểm tra {checkResult.summary.selectedCount} linh kiện, phát hiện{" "}
            {checkResult.summary.errorCount} lỗi và {checkResult.summary.warningCount} cảnh
            báo.
          </p>

          {checkResult.issues.length > 0 ? (
            <ul className="space-y-2">
              {checkResult.issues.map((issue, index) => (
                <li key={`${issue.ruleId}-${index}`} className="rounded border p-2 text-sm">
                  <span
                    className={
                      issue.severity === "error"
                        ? "text-destructive font-medium"
                        : "text-amber-700 font-medium"
                    }
                  >
                    {issue.severity === "error" ? "Lỗi" : "Cảnh báo"}:
                  </span>{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Không có cảnh báo nào.</p>
          )}
        </div>
      )}

      {suggestResult && (
        <div className="rounded-lg border p-4 space-y-3">
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
                <div key={item.product.id} className="rounded border p-3 space-y-1">
                  <p className="font-medium line-clamp-2">{item.product.name}</p>
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
