"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useApiProviders } from "@/hooks/use-api-providers";
import { useToast } from "@/hooks/use-toast";
import { fetchData } from "@/lib/actions";
import { getNestedValue } from "@/lib/utils";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import {
  BarChart,
  Table,
  TrendingUp,
  PlusCircle,
  LayoutGrid,
} from "lucide-react";

import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AddWidgetDialog from "@/components/dashboard/add-widget-dialog";
import ApiConfigDialog from "@/components/dashboard/api-config-dialog";
import ConfigureWidgetDialog from "@/components/dashboard/configure-widget-dialog";
import TemplatesDialog from "@/components/dashboard/templates-dialog";

import { WidgetCard } from "@/components/dashboard/widgets/widget-card";
import DataTableWidget from "@/components/dashboard/widgets/data-table-widget";
import StockChartWidget from "@/components/dashboard/widgets/stock-chart-widget";
import KeyMetricsWidget from "@/components/dashboard/widgets/key-metrics-widget";
import { ApiProviderProvider } from "@/hooks/use-api-providers";

const ResponsiveGridLayout = WidthProvider(Responsive);

export type WidgetComponentType = (props: {
  id: string;
  title: string;
  onRemove: () => void;
  onConfigure: () => void;
  onAddWidget?: (widget: any) => void;
  config?: WidgetConfig;
}) => ReactNode;

export type SelectedField = {
  path: string;
  label: string;
  format?: string;
  isArray?: boolean;
};

export type WidgetConfig = {
  dataSource?: string;
  refreshInterval?: string;
  apiProvider?: string;
  customApiEndpoint?: string;
  chartType?: string;
  timeInterval?: string;
  cardType?: string;
  selectedFields?: SelectedField[];
  arrayDataPath?: string;
  [key: string]: any;
};

export type Widget = {
  id: string;
  componentName: string;
  title: string;
  config?: WidgetConfig;
  layout: {
    lg: Layout;
  };
};

// Helper to map component names to actual components and icons
const componentMap: Record<
  string,
  { component: React.FC<any>; icon: React.ReactNode }
> = {
  StockChartWidget: {
    component: StockChartWidget,
    icon: <TrendingUp className="h-5 w-5 text-muted-foreground" />,
  },
  KeyMetricsWidget: {
    component: KeyMetricsWidget,
    icon: <BarChart className="h-5 w-5 text-muted-foreground" />,
  },
  DataTableWidget: {
    component: DataTableWidget,
    icon: <Table className="h-5 w-5 text-muted-foreground" />,
  },
};

// Main data mapping functions, moved to page level to be used by fetch
const mapDataTableData = (data: any, config?: WidgetConfig): any[] => {
  if (!data) return [];
  if (data.bestMatches)
    return data.bestMatches.map((item: any) => ({
      symbol: item["1. symbol"],
      name: item["2. name"],
      type: item["3. type"],
      region: item["4. region"],
    }));
  if (data.result)
    return data.result.map((item: any) => ({
      symbol: item.symbol,
      description: item.description,
      type: item.type,
    }));

  if (
    config?.dataSource === "custom" &&
    config?.selectedFields &&
    config.selectedFields.length > 0
  ) {
    let sourceData = config.arrayDataPath
      ? getNestedValue(data, config.arrayDataPath)
      : Object.values(data).find(Array.isArray) ||
        (Array.isArray(data) ? data : []);
    if (!Array.isArray(sourceData)) return [];

    return sourceData.map((item) => {
      const row: { [key: string]: any } = {};
      if (typeof item !== "object" || item === null) return {};
      config.selectedFields!.forEach((field) => {
        row[field.label] = getNestedValue(item, field.path);
      });
      return row;
    });
  }
  if (Array.isArray(data)) return data;
  return [];
};

const mapChartData = (data: any, config?: WidgetConfig): any[] => {
  if (!data) return [];
  const seriesKey = Object.keys(data).find((key) =>
    key.includes("Time Series")
  );
  if (seriesKey && data[seriesKey])
    return Object.entries(data[seriesKey])
      .map(([date, values]: [string, any]) => ({
        date: date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
      }))
      .reverse();
  if (data.c && data.t)
    return data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index],
    }));

  if (config?.selectedFields && config.selectedFields.length > 0) {
    let sourceArray = getNestedValue(data, config.selectedFields[0].path);
    if (!Array.isArray(sourceArray)) {
      const possibleArray = Object.values(data).find(Array.isArray);
      if (possibleArray) sourceArray = possibleArray;
      else return [];
    }

    if (
      sourceArray.length > 0 &&
      Array.isArray(sourceArray[0]) &&
      sourceArray[0].length === 2 &&
      typeof sourceArray[0][0] === "number"
    ) {
      return sourceArray.map((item: [number, number]) => ({
        date: new Date(item[0]).toISOString(),
        close: item[1],
      }));
    }

    return sourceArray
      .map((item: any) => {
        if (typeof item !== "object" || item === null) return null;
        const dateKey =
          Object.keys(item).find((k) =>
            ["date", "time", "timestamp"].some((w) =>
              k.toLowerCase().includes(w)
            )
          ) || "date";
        const closeKey =
          Object.keys(item).find((k) =>
            ["close", "price", "value"].some((w) => k.toLowerCase().includes(w))
          ) || "close";
        let dateValue = item[dateKey];
        if (typeof dateValue === "number" && String(dateValue).length === 10)
          dateValue *= 1000;
        return {
          date: new Date(dateValue).toISOString(),
          close: parseFloat(item[closeKey]),
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
        };
      })
      .filter(Boolean);
  }
  return [];
};

function HomePageContent() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const [widgetState, setWidgetState] = useState<
    Record<
      string,
      { isLoading: boolean; error: string | null; lastUpdated: string | null }
    >
  >({});

  const [configuringWidget, setConfiguringWidget] = useState<Widget | null>(
    null
  );
  const [isTemplatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [isAddWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);
  const [isApiConfigDialogOpen, setApiConfigDialogOpen] = useState(false);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const importFileRef = useRef<HTMLInputElement>(null);
  const { getProviderById } = useApiProviders();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const savedWidgets = localStorage.getItem("dashboard-widgets");
        if (savedWidgets) setWidgets(JSON.parse(savedWidgets));
      } catch (error) {
        console.error("Failed to load widgets from local storage", error);
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      try {
        if (widgets.length > 0)
          localStorage.setItem("dashboard-widgets", JSON.stringify(widgets));
        else localStorage.removeItem("dashboard-widgets");
      } catch (error) {
        console.error("Failed to save widgets to local storage", error);
      }
    }
  }, [widgets, isClient]);

  const fetchWidgetData = useCallback(
    async (widget: Widget) => {
      const { id, config } = widget;
      if (!config) return;

      setWidgetState((prev) => ({
        ...prev,
        [id]: {
          isLoading: true,
          error: null,
          lastUpdated: prev[id]?.lastUpdated || null,
        },
      }));

      let result: { data?: any; error?: string } = {};

      if (config.customApiEndpoint) {
        result = await fetchData({ customUrl: config.customApiEndpoint });
      } else {
        const provider = getProviderById(config.apiProvider);
        if (!provider) {
          setWidgetState((prev) => ({
            ...prev,
            [id]: {
              isLoading: false,
              error: "Please select an API provider.",
              lastUpdated: null,
            },
          }));
          return;
        }

        let endpointName: string | undefined;
        let params: Record<string, string> = {
          symbol: config.symbol || "IBM",
          keywords: config.keywords || "tesco",
        };

        switch (widget.componentName) {
          case "StockChartWidget":
            params.from = String(Math.floor(Date.now() / 1000) - 31536000); // 1 year ago
            params.to = String(Math.floor(Date.now() / 1000));
            endpointName =
              config.timeInterval === "daily" ? "daily" : "intraday";
            if (provider.id === "finnhub") endpointName = "candles";
            break;
          case "KeyMetricsWidget":
            endpointName = "quote";
            break;
          case "DataTableWidget":
            endpointName = "search";
            break;
        }

        if (endpointName) {
          result = await fetchData({ provider, endpointName, params });
        } else {
          result = {
            error:
              "Could not determine endpoint for this widget type and provider.",
          };
        }
      }

      if (
        result.error ||
        (result.data &&
          (result.data["Information"] ||
            result.data["Note"] ||
            result.data["Error Message"]))
      ) {
        const errorMessage =
          result.error ||
          result.data["Information"] ||
          result.data["Note"] ||
          result.data["Error Message"];
        setWidgetState((prev) => ({
          ...prev,
          [id]: {
            isLoading: false,
            error: errorMessage,
            lastUpdated: prev[id]?.lastUpdated || null,
          },
        }));
        setWidgetData((prev) => ({ ...prev, [id]: null }));
      } else if (result.data) {
        let mappedData = result.data;
        if (widget.componentName === "DataTableWidget")
          mappedData = mapDataTableData(result.data, config);
        if (widget.componentName === "StockChartWidget")
          mappedData = mapChartData(result.data, config);

        setWidgetData((prev) => ({ ...prev, [id]: mappedData }));
        setWidgetState((prev) => ({
          ...prev,
          [id]: {
            isLoading: false,
            error: null,
            lastUpdated: new Date().toLocaleTimeString(),
          },
        }));
      }
    },
    [getProviderById]
  );

  useEffect(() => {
    widgets.forEach((widget) => {
      fetchWidgetData(widget);
      const intervalSeconds = widget.config?.refreshInterval
        ? parseInt(widget.config.refreshInterval, 10)
        : 0;
      if (intervalSeconds > 0) {
        const intervalId = setInterval(
          () => fetchWidgetData(widget),
          intervalSeconds * 1000
        );
        return () => clearInterval(intervalId);
      }
    });
  }, [widgets, fetchWidgetData]);

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
  };

  const addWidget = (widget: Omit<Widget, "id">) => {
    const newId = `widget-${Date.now()}-${Math.random()}`;
    const newWidget: Widget = {
      ...widget,
      id: newId,
      layout: { lg: { ...widget.layout.lg, i: newId } },
    };
    setWidgets([...widgets, newWidget]);
    setAddWidgetDialogOpen(false);
  };

  const handleUpdateWidget = (updatedWidget: Widget) => {
    setWidgets(
      widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );
    fetchWidgetData(updatedWidget);
    setConfiguringWidget(null);
  };

  const handleSelectTemplate = (templateWidgets: Omit<Widget, "id">[]) => {
    const newWidgets = templateWidgets.map((widget, index) => {
      const newId = `widget-${Date.now()}-${index}`;
      return {
        ...widget,
        id: newId,
        layout: {
          lg: {
            ...(widget.layout?.lg || { x: 0, y: 0, w: 4, h: 2 }),
            i: newId,
          },
        },
      };
    });
    setWidgets(newWidgets);
    setTemplatesDialogOpen(false);
  };

  const handleExport = () => {
    if (widgets.length === 0) {
      toast({
        title: "Cannot Export",
        description: "There are no widgets on the dashboard to export.",
        variant: "destructive",
      });
      return;
    }
    const dataStr = JSON.stringify(widgets, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "dashboard-config.json");
    linkElement.click();
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedWidgets = JSON.parse(e.target?.result as string);
        if (
          Array.isArray(importedWidgets) &&
          importedWidgets.every(
            (w) => w.id && w.componentName && w.title && w.layout?.lg
          )
        ) {
          setWidgets(importedWidgets);
        } else {
          toast({
            title: "Import Failed",
            description:
              "Invalid file format. Please import a valid widget configuration file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Could not parse the JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleClear = () => {
    setWidgets([]);
    setClearConfirmOpen(false);
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    if (newLayout.length !== widgets.length) return;
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) => {
        const layoutItem = newLayout.find((l) => l.i === widget.id);
        return layoutItem ? { ...widget, layout: { lg: layoutItem } } : widget;
      })
    );
  };

  if (!isClient) {
    return null;
  }

  const currentLayout = widgets.map((w) => w.layout.lg);

  return (
    <div className="flex w-full flex-col bg-muted/40">
      <Header
        widgetCount={widgets.length}
        onExport={handleExport}
        onImport={handleImportClick}
        onClear={() => setClearConfirmOpen(true)}
        onAddWidget={() => setAddWidgetDialogOpen(true)}
        onOpenTemplates={() => setTemplatesDialogOpen(true)}
        onOpenApiConfig={() => setApiConfigDialogOpen(true)}
      />
      <main className="flex-1 p-4 md:p-8">
        {widgets.length > 0 ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: currentLayout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            onLayoutChange={onLayoutChange}
            draggableHandle=".widget-drag-handle"
          >
            {widgets.map((widget) => {
              const { component: WidgetContent, icon } = componentMap[
                widget.componentName
              ] || { component: null, icon: null };
              const { isLoading, error, lastUpdated } = widgetState[
                widget.id
              ] || { isLoading: true, error: null, lastUpdated: null };
              const data = widgetData[widget.id];

              if (!WidgetContent || !icon) {
                return <div key={widget.id}>Error: Widget type not found</div>;
              }

              const contentProps: any = { config: widget.config };
              if (
                widget.componentName === "DataTableWidget" ||
                widget.componentName === "StockChartWidget"
              ) {
                contentProps.data = data || [];
              } else {
                contentProps.rawData = data;
              }

              return (
                <div key={widget.id}>
                  <WidgetCard
                    title={widget.title}
                    icon={icon}
                    onRemove={() => removeWidget(widget.id)}
                    onConfigure={() => setConfiguringWidget(widget)}
                    onRefresh={() => fetchWidgetData(widget)}
                    isRefreshing={isLoading && !!lastUpdated}
                    isLoading={isLoading && !lastUpdated}
                    error={error}
                    lastUpdated={lastUpdated}
                    hasData={!!data}
                  >
                    <WidgetContent {...contentProps} />
                  </WidgetCard>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        ) : (
          <div className="flex h-full min-h-[calc(100vh-14rem)] flex-col items-center justify-center">
            <Card className="w-full max-w-4xl p-8">
              <CardHeader className="p-0 text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome to FinDash
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Your customizable real-time finance monitoring dashboard.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card className="flex flex-col items-center justify-center p-8 text-center transition-all hover:shadow-lg">
                    <CardHeader className="p-0 items-center mb-8">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <PlusCircle className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle>Add Your First Widget</CardTitle>
                      <CardDescription>
                        Start by adding a widget to monitor stocks, crypto, or
                        other financial data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => setAddWidgetDialogOpen(true)}>
                        Add Widget
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="flex flex-col items-center justify-center p-8 text-center transition-all hover:shadow-lg">
                    <CardHeader className="p-0 items-center mb-8">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <LayoutGrid className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle>Browse Templates</CardTitle>
                      <CardDescription>
                        Not sure where to start? Use a pre-built template to get
                        up and running quickly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => setTemplatesDialogOpen(true)}
                      >
                        Browse Templates
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      {configuringWidget && (
        <ConfigureWidgetDialog
          widget={configuringWidget}
          open={!!configuringWidget}
          onOpenChange={(isOpen) => !isOpen && setConfiguringWidget(null)}
          onSave={handleUpdateWidget}
        />
      )}
      <TemplatesDialog
        open={isTemplatesDialogOpen}
        onOpenChange={setTemplatesDialogOpen}
        onSelectTemplate={handleSelectTemplate}
      />
      <AddWidgetDialog
        open={isAddWidgetDialogOpen}
        onOpenChange={setAddWidgetDialogOpen}
        onAddWidget={addWidget}
        currentLayout={currentLayout}
      />
      <ApiConfigDialog
        open={isApiConfigDialogOpen}
        onOpenChange={setApiConfigDialogOpen}
      />
      <AlertDialog open={isClearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              current dashboard layout and all widget configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <input
        type="file"
        ref={importFileRef}
        className="hidden"
        accept="application/json"
        onChange={handleImport}
        aria-label="Import dashboard JSON"
      />
    </div>
  );
}

export default function Home() {
  return (
    <ApiProviderProvider>
      <HomePageContent />
    </ApiProviderProvider>
  );
}
