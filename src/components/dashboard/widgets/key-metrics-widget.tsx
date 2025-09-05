"use client";

import {
  BarChart,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
} from "lucide-react";
import type { WidgetConfig } from "@/app/page";
import { useMemo } from "react";
import { getNestedValue } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface KeyMetricsWidgetProps {
  config?: WidgetConfig;
  rawData: any;
}

const formatNumber = (value: number | string | undefined): string => {
  if (value === null || value === undefined) return "N/A";

  const num = Number(String(value).replace(/[^0-9.-]+/g, ""));

  if (isNaN(num)) return "N/A";

  if (Math.abs(num) >= 1_000_000_000_000)
    return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(num) >= 1_000_000_000)
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`;

  // Check for small numbers that don't need scientific notation but might need precision.
  if (Math.abs(num) > 0.0001 && Math.abs(num) < 10000) {
    // Show 2 decimal places for numbers > 1, more for smaller numbers.
    const fractionDigits = Math.abs(num) > 1 ? 2 : 4;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: fractionDigits,
    });
  }

  return String(num);
};

export default function KeyMetricsWidget({
  config,
  rawData,
}: KeyMetricsWidgetProps) {
  const cardData = useMemo(() => {
    if (!rawData || typeof rawData !== "object") return { type: "empty" };

    // Custom Financial Data Card - This should be checked first
    if (
      config?.cardType === "financial-data" &&
      config?.selectedFields &&
      config.selectedFields.length > 0
    ) {
      let sourceData = rawData;
      if (config.arrayDataPath) {
        sourceData = getNestedValue(rawData, config.arrayDataPath);
      }

      if (Array.isArray(sourceData)) {
        sourceData = sourceData[0];
      }

      if (typeof sourceData === "object" && sourceData !== null) {
        const metrics = config.selectedFields
          .map((field) => {
            const rawValue = getNestedValue(sourceData, field.path);
            const formattedValue = formatNumber(rawValue);
            return {
              name: field.label,
              value: formattedValue,
            };
          })
          .filter((metric) => metric.value !== "N/A" && metric.value !== "NaN");

        if (metrics.length > 0) {
          return { type: "custom", data: metrics };
        }
      }
    }

    // Alpha Vantage Quote
    if (rawData["Global Quote"]) {
      const quote = rawData["Global Quote"];
      const change = parseFloat(quote["09. change"]);
      return {
        type: "quote",
        data: {
          symbol: quote["01. symbol"],
          price: parseFloat(quote["05. price"]),
          change: change,
          changePercent: parseFloat(
            quote["10. change percent"]?.replace("%", "")
          ),
          isPositive: change > 0,
          high: parseFloat(quote["03. high"]),
          low: parseFloat(quote["04. low"]),
          open: parseFloat(quote["02. open"]),
          volume: parseInt(quote["06. volume"], 10),
        },
      };
    }

    // Finnhub Quote (Stocks & Crypto)
    const isFinnhubCrypto =
      config?.apiProvider === "finnhub" &&
      (config?.symbol?.toUpperCase().includes("USD") ||
        config?.symbol?.toUpperCase().includes("BTC") ||
        config?.symbol?.toUpperCase().includes("ETH"));

    if (
      typeof rawData.c === "number" &&
      (isFinnhubCrypto || typeof rawData.d === "number")
    ) {
      const change = rawData.d;
      return {
        type: "quote",
        data: {
          symbol: config?.symbol?.toUpperCase() || "QUOTE",
          price: rawData.c,
          change: rawData.d,
          changePercent: rawData.dp,
          isPositive: change > 0,
          high: rawData.h,
          low: rawData.l,
          open: rawData.o,
          volume: rawData.v,
          previousClose: rawData.pc,
        },
      };
    }

    // Removed Forex card support

    return { type: "empty" };
  }, [rawData, config]);

  const renderContent = () => {
    switch (cardData.type) {
      case "quote":
        return <QuoteCard data={cardData.data} />;
      case "custom":
        return <CustomCard data={cardData.data} />;
      case "empty":
      default:
        return null;
    }
  };

  return renderContent();
}

// ForexCard removed

function QuoteCard({ data }: { data: any }) {
  const formatCurrency = (value: number | string | undefined) => {
    if (typeof value !== "number") return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    }).format(value);
  };

  const formatVolume = (value: number | undefined) => {
    if (typeof value !== "number" || isNaN(value)) return "N/A";
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toString();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight">{data.symbol}</h3>
          <DollarSign className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold tracking-tight">
          {formatCurrency(data.price)}
        </div>
        <div
          className={`flex items-center mt-1 ${
            data.isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {data.isPositive ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span className="font-medium">
            {data.change?.toFixed(2)} ({data.changePercent?.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">High</p>
          <p className="font-semibold text-card-foreground">
            {formatCurrency(data.high)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Low</p>
          <p className="font-semibold text-card-foreground">
            {formatCurrency(data.low)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Open</p>
          <p className="font-semibold text-card-foreground">
            {formatCurrency(data.open)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Volume</p>
          <p className="font-semibold text-card-foreground">
            {formatVolume(data.volume)}
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomCard({ data }: { data: { name: string; value: string }[] }) {
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      {data.map((metric) => (
        <div key={metric.name}>
          <div
            className="text-sm text-muted-foreground truncate"
            title={metric.name}
          >
            {metric.name}
          </div>
          <div className="flex items-baseline gap-2">
            <p
              className="text-2xl font-bold tracking-tight truncate"
              title={metric.value}
            >
              {metric.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
