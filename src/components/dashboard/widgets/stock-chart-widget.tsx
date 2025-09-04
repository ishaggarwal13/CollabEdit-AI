"use client";

import { WidgetConfig } from "@/app/page";
import { useMemo, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface StockChartWidgetProps {
  config?: WidgetConfig;
  data?: any[];
}

export default function StockChartWidget({
  config,
  data,
}: StockChartWidgetProps) {
  const { theme } = useTheme();
  const chartRef = useRef<ChartJS<"line">>(null);
  const chartData = Array.isArray(data) ? data : [];

  const { chartOptions, chartDatasets } = useMemo(() => {
    const isDarkMode = theme === "dark";
    const textColor = isDarkMode ? "#e5e7eb" : "#374151";
    const gridColor = isDarkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";
    const chartType = config?.chartType || "line";

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: {
          display: chartType === "candle",
          position: "top" as const,
          labels: { color: textColor },
        },
        tooltip: {
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          callbacks: {
            label: (context: any) =>
              `${context.dataset.label}: ${context.formattedValue}`,
          },
        },
      },
      scales: {
        x: {
          type: "time" as const,
          time: { tooltipFormat: "PPpp", displayFormats: { day: "MMM dd" } },
          grid: { color: gridColor },
          ticks: { color: textColor },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: (value: any) => `$${Number(value).toFixed(2)}`,
          },
        },
      },
      elements: { point: { radius: 0, hoverRadius: 4 } },
    };

    let chartDatasets: any[] = [];
    if (chartData.length > 0) {
      if (chartType === "candle") {
        chartDatasets = [
          {
            label: "High",
            data: chartData.map((d) => ({ x: d.date, y: d.high })),
            borderColor: "hsl(var(--chart-2))",
            tension: 0.1,
          },
          {
            label: "Low",
            data: chartData.map((d) => ({ x: d.date, y: d.low })),
            borderColor: "hsl(var(--chart-3))",
            tension: 0.1,
          },
          {
            label: "Close",
            data: chartData.map((d) => ({ x: d.date, y: d.close })),
            borderColor: "hsl(var(--chart-1))",
            borderWidth: 2,
            tension: 0.1,
            fill: true,
            backgroundColor: isDarkMode
              ? "hsla(var(--chart-1), 0.1)"
              : "hsla(var(--chart-1), 0.2)",
          },
        ];
      } else {
        // line chart
        chartDatasets = [
          {
            label: "Price",
            data: chartData.map((d) => ({ x: d.date, y: d.close })),
            borderColor: "hsl(var(--chart-1))",
            backgroundColor: isDarkMode
              ? "hsla(var(--chart-1), 0.1)"
              : "hsla(var(--chart-1), 0.2)",
            fill: true,
            tension: 0.1,
          },
        ];
      }
    }
    return { chartOptions, chartDatasets };
  }, [chartData, theme, config?.chartType]);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.options = chartOptions;
      chart.update();
    }
  }, [chartOptions]);

  return (
    <div className="h-full w-full">
      <Line
        ref={chartRef}
        data={{ datasets: chartDatasets }}
        options={chartOptions}
      />
    </div>
  );
}
