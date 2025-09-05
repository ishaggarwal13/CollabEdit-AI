"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WidgetConfig } from "@/app/page";
import { Input } from "@/components/ui/input";
import { useApiProviders } from "@/hooks/use-api-providers";
import FieldSelector from "./field-selector";
import { useEffect, useState } from "react";

interface CardWidgetConfigProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

export default function CardWidgetConfig({
  config,
  setConfig,
}: CardWidgetConfigProps) {
  const { providers } = useApiProviders();
  const [endpointUrl, setEndpointUrl] = useState("");

  const handleSelectChange = (key: keyof WidgetConfig) => (value: string) => {
    const newConfig = { ...config, [key]: value };
    if (key === "apiProvider" || key === "cardType") {
      newConfig.customApiEndpoint = "";
      newConfig.selectedFields = [];
    }
    setConfig(newConfig);
  };

  const handleEndpointChange = (value: string) => {
    // Removing custom endpoint usage; rely on provider endpoints
    setEndpointUrl(value);
  };

  useEffect(() => {
    let url = "";
    if (
      !url &&
      config.cardType !== "watchlist" &&
      config.cardType !== "forex"
    ) {
      const selectedProvider = providers.find(
        (p) => p.id === config.apiProvider
      );
      if (selectedProvider) {
        const endpoint = selectedProvider.endpoints.find(
          (e) => e.name === "quote"
        );
        if (endpoint) {
          url = `${selectedProvider.baseUrl}${endpoint.path}`
            .replace("{symbol}", config.symbol || "IBM")
            .replace("{apiKey}", selectedProvider.apiKey || "");
        }
      }
    }
    setEndpointUrl(url);
  }, [config.apiProvider, config.symbol, providers, config.cardType]);

  return (
    <>
      <div>
        <Label>Card Type</Label>
        <Select
          onValueChange={handleSelectChange("cardType")}
          value={config.cardType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select card type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="watchlist">Watchlist (Pre-defined)</SelectItem>
            <SelectItem value="financial-data">
              Financial Data (Custom)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.cardType === "watchlist" ? (
        <>
          <p className="text-sm text-muted-foreground p-4 text-center bg-muted rounded-md">
            The Watchlist card is pre-configured to work with the Quote endpoint
            of the selected provider.
          </p>
          <div>
            <Label>API Provider</Label>
            <Select
              onValueChange={handleSelectChange("apiProvider")}
              value={config.apiProvider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers
                  .filter((p) => p.enabled)
                  .map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., AAPL, MSFT, BINANCE:BTCUSDT"
              value={config.symbol || ""}
              onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
            />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>API Provider</Label>
            <Select
              onValueChange={handleSelectChange("apiProvider")}
              value={config.apiProvider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers
                  .filter((p) => p.enabled)
                  .map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select a provider to use its default endpoint, or enter a full URL
              below.
            </p>
          </div>
          <div>
            <Label htmlFor="custom-api-endpoint">API Endpoint URL</Label>
            <Input
              id="custom-api-endpoint"
              placeholder="https://api.example.com/data"
              value={""}
              onChange={(e) => handleEndpointChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Override the provider's default by entering a full URL.
            </p>
          </div>
          <div>
            <Label htmlFor="array-data-path">
              Root Path for Data (Optional)
            </Label>
            <Input
              id="array-data-path"
              placeholder="e.g., data.results"
              value={config.arrayDataPath || ""}
              onChange={(e) =>
                setConfig({ ...config, arrayDataPath: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              If your data is nested inside an object, specify the path to it
              here.
            </p>
          </div>

          {endpointUrl && (
            <FieldSelector
              endpointUrl={endpointUrl}
              selectedFields={config.selectedFields || []}
              setSelectedFields={(fields) =>
                setConfig({ ...config, selectedFields: fields })
              }
              allowMultiple={true}
            />
          )}
        </div>
      )}

      <div>
        <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
        <Input
          id="refresh-interval"
          placeholder="e.g., 30"
          value={config.refreshInterval || ""}
          onChange={(e) =>
            setConfig({ ...config, refreshInterval: e.target.value })
          }
        />
      </div>
    </>
  );
}
