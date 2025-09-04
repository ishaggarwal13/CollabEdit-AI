
'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WidgetConfig } from '@/app/page';
import { Input } from '@/components/ui/input';
import { useApiProviders } from '@/hooks/use-api-providers';
import FieldSelector from './field-selector';
import { useEffect, useState } from 'react';

interface ChartWidgetConfigProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

export default function ChartWidgetConfig({ config, setConfig }: ChartWidgetConfigProps) {
  const { providers } = useApiProviders();
  const [endpointUrl, setEndpointUrl] = useState(config.customApiEndpoint || '');

  const handleSelectChange = (key: keyof WidgetConfig) => (value: string) => {
    setConfig({ ...config, [key]: value, customApiEndpoint: '', selectedFields: [] });
  };
  
  const handleInputChange = (key: keyof WidgetConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [key]: event.target.value });
  }

  const handleEndpointChange = (value: string) => {
    setConfig({ ...config, customApiEndpoint: value, selectedFields: [] });
    setEndpointUrl(value);
  }
  
  useEffect(() => {
    let url = config.customApiEndpoint || '';
    if (!url) {
        const selectedProvider = providers.find(p => p.id === config.apiProvider);
        if (selectedProvider) {
            const endpointName = config?.timeInterval === 'daily' ? 'daily' : 'intraday';
            const endpoint = selectedProvider.endpoints.find(e => e.name === endpointName);
            if (endpoint) {
                url = `${selectedProvider.baseUrl}${endpoint.path}`
                    .replace('{symbol}', config.symbol || 'IBM')
                    .replace('{apiKey}', selectedProvider.apiKey);
            }
        }
    }
    setEndpointUrl(url);
  }, [config.apiProvider, config.symbol, config.timeInterval, config.customApiEndpoint, providers]);


  return (
    <>
      <div>
        <Label>Chart Type</Label>
        <Select onValueChange={(value) => setConfig({...config, chartType: value})} value={config.chartType}>
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="candle">Candle Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

        <div>
            <Label>API Provider</Label>
            <Select onValueChange={handleSelectChange('apiProvider')} value={config.apiProvider}>
            <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
                {providers.filter(p => p.enabled).map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                    </SelectItem>
                ))}
            </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
                Choose a pre-configured provider or enter a custom URL below.
            </p>
        </div>

        <div className="space-y-2">
            <Label htmlFor="custom-api-endpoint">API Endpoint URL (Advanced)</Label>
            <Input
                id="custom-api-endpoint"
                placeholder="Leave empty to use provider default"
                value={config.customApiEndpoint || ''}
                onChange={(e) => handleEndpointChange(e.target.value)}
            />
        </div>
      
        <div>
            <Label>Time Interval</Label>
            <Select onValueChange={(value) => setConfig({...config, timeInterval: value})} value={config.timeInterval}>
            <SelectTrigger>
                <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="intraday">Intraday (5min)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
            id="symbol"
            placeholder="e.g., AAPL, MSFT"
            value={config.symbol || ''}
            onChange={handleInputChange('symbol')}
            />
        </div>

      {endpointUrl && (
          <div className="space-y-4">
            <FieldSelector
                endpointUrl={endpointUrl}
                selectedFields={config.selectedFields || []}
                setSelectedFields={(fields) => setConfig({ ...config, selectedFields: fields })}
                allowMultiple={false}
                filter="arrays"
            />
            {config.selectedFields && config.selectedFields.length > 0 &&
                <p className="text-xs text-muted-foreground p-2 text-center bg-muted rounded-md">
                    Chart widgets will use the selected field to find an array of data. It will look for sibling keys named `open`, `high`, `low`, `close`, and a date/time field for the axes.
                </p>
            }
          </div>
      )}


      <div>
        <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
        <Input
          id="refresh-interval"
          placeholder="e.g., 30"
          value={config.refreshInterval || ''}
          onChange={handleInputChange('refreshInterval')}
        />
      </div>
    </>
  );
}
