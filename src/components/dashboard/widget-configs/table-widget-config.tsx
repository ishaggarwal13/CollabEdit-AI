
'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WidgetConfig, SelectedField } from '@/app/page';
import { Input } from '@/components/ui/input';
import { useApiProviders } from '@/hooks/use-api-providers';
import FieldSelector from './field-selector';
import { useState, useEffect } from 'react';

interface TableWidgetConfigProps {
  config: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
}

export default function TableWidgetConfig({ config, setConfig }: TableWidgetConfigProps) {
    const { providers } = useApiProviders();
    const [manualFields, setManualFields] = useState((config.selectedFields || []).map(f => f.path).join(', '));

    useEffect(() => {
        setManualFields((config.selectedFields || []).map(f => f.path).join(', '));
    }, [config.selectedFields]);


    const handleSelectChange = (key: keyof WidgetConfig) => (value: string) => {
        setConfig({ ...config, [key]: value, customApiEndpoint: '', selectedFields: [] });
    };

    const handleInputChange = (key: keyof WidgetConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setConfig({ ...config, [key]: event.target.value });
    }

    const handleEndpointChange = (value: string) => {
      setConfig({ ...config, customApiEndpoint: value, selectedFields: [] });
    }

    const handleManualFieldsBlur = () => {
        const fieldNames = manualFields.split(',').map(s => s.trim()).filter(Boolean);
        const newSelectedFields: SelectedField[] = fieldNames.map(name => ({
            path: name,
            label: name,
            isArray: false,
        }));
        setConfig({ ...config, selectedFields: newSelectedFields });
    }

    // This is used to derive the array path for custom APIs
    const handleArrayPathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, arrayDataPath: event.target.value });
    }

  const enabledProviders = providers.filter(p => p.enabled);

  return (
    <>
       <div>
        <Label>Data Source</Label>
        <Select onValueChange={handleSelectChange('dataSource')} value={config.dataSource}>
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stock-search">Stock Search (Pre-defined)</SelectItem>
            <SelectItem value="custom">Custom API</SelectItem>
          </SelectContent>
        </Select>
      </div>

       {config.dataSource === 'stock-search' ? (
          <>
            <p className="text-sm text-muted-foreground p-4 text-center bg-muted rounded-md">
                The Stock Search table is pre-configured to work with the Search endpoint of the selected provider.
            </p>
            <div>
              <Label>API Provider</Label>
              <Select onValueChange={handleSelectChange('apiProvider')} value={config.apiProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {enabledProviders.length > 0 ? (
                      enabledProviders.map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                          </SelectItem>
                      ))
                  ) : (
                      <SelectItem value="none" disabled>No enabled providers</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
             <div>
                <Label htmlFor="keywords">Search Keywords</Label>
                <Input
                id="keywords"
                placeholder="e.g., tesco, ibm"
                value={config.keywords || ''}
                onChange={handleInputChange('keywords')}
                />
            </div>
          </>
      ) : (
        <>
            <div>
                <Label htmlFor="custom-api-endpoint">API Endpoint URL</Label>
                <Input
                    id="custom-api-endpoint"
                    placeholder="https://api.example.com/data"
                    value={config.customApiEndpoint || ''}
                    onChange={(e) => handleEndpointChange(e.target.value)}
                />
                 <p className="text-xs text-muted-foreground mt-1">
                    Enter the full URL for the API you want to use.
                </p>
            </div>
            <div>
                <Label htmlFor="array-data-path">Root Path for Array Data (Optional)</Label>
                <Input
                    id="array-data-path"
                    placeholder="e.g., data.results"
                    value={config.arrayDataPath || ''}
                    onChange={handleArrayPathChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    If your data is nested inside an object, specify the path to the array here.
                </p>
            </div>
            <div>
                <Label htmlFor="display-fields">Display Fields (Manual Entry)</Label>
                <Input
                    id="display-fields"
                    placeholder="name, current_price, price_change_percentage_24h"
                    value={manualFields}
                    onChange={(e) => setManualFields(e.target.value)}
                    onBlur={handleManualFieldsBlur}
                />
                 <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated list of fields from the API response to show as columns.
                </p>
            </div>
        </>
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
