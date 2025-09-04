
'use server';

import type { ApiProvider } from "./api-providers";
import { getNestedValue } from "./utils";

type FetchDataParams = {
    provider?: ApiProvider;
    endpointName?: string;
    params?: Record<string, string>;
    customUrl?: string;
};

export async function fetchData({ provider, endpointName, params, customUrl }: FetchDataParams) {
    let finalUrl = '';

    if (customUrl) {
        finalUrl = customUrl;
    } else if (provider && endpointName && params) {
        if (!provider.enabled) {
            return { error: `Provider ${provider.name} is not enabled.` };
        }
        
        if (!provider.apiKey) {
            return { error: `API key for ${provider.name} is missing.` };
        }

        const endpoint = provider.endpoints.find(e => e.name === endpointName);
        if (!endpoint) {
            return { error: `Endpoint '${endpointName}' not found for provider '${provider.name}'.` };
        }

        let urlPath = endpoint.path;
        for (const key in params) {
            urlPath = urlPath.replace(`{${key}}`, encodeURIComponent(params[key]));
        }
        
        urlPath = urlPath.replace(`{apiKey}`, provider.apiKey);

        finalUrl = `${provider.baseUrl}${urlPath}`;
    } else {
         return { error: 'Either a provider or a custom URL must be specified.' };
    }

    try {
        const response = await fetch(finalUrl, {
            headers: {
                'User-Agent': 'FinDash-Dashboard/1.0'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed for ${finalUrl} with status ${response.status}: ${errorText}`);
            return { error: `API request failed: ${response.statusText} (${response.status})` };
        }

        const data = await response.json();
        return { data };

    } catch (error: any) {
        console.error('Failed to fetch data:', error);
        return { error: error.message || 'An unknown error occurred.' };
    }
}

export async function testApiEndpoint(url: string) {
    if (!url) {
        return { success: false, error: 'URL is required.' };
    }
    
    // Basic check to prevent requests to local network etc.
    if (!url.startsWith('https') && !url.startsWith('http')) {
        return { success: false, error: 'URL must start with http or https.'}
    }

    try {
        const response = await fetch(url, {
             headers: {
                'User-Agent': 'FinDash-Dashboard/1.0'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return { success: false, error: `Test failed: ${response.statusText} (${response.status})` };
        }

        const data = await response.json();
        if (typeof data === 'object' && data !== null) {
             return { success: true, data };
        } else {
             return { success: false, error: 'Test successful, but response was not valid JSON.' };
        }
    } catch (error: any) {
        console.error('Test API endpoint failed:', error);
        return { success: false, error: error.message || 'An unknown error occurred during the test.' };
    }
}


const flattenObject = (obj: any, parentKey = '', result: Record<string, any> = {}) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], propName, result);
      } else {
        result[propName] = obj[key];
      }
    }
  }
  return result;
};

export async function getAndFlattenApiData(url: string) {
    const result = await testApiEndpoint(url);
    if (!result.success || !result.data) {
        return { ...result, flattenedData: [] };
    }

    const flattened = flattenObject(result.data);
    const flattenedWithTypes = Object.entries(flattened).map(([path, value]) => {
         let type: 'string' | 'number' | 'boolean' | 'array' | 'object' = typeof value;
         if (Array.isArray(value)) type = 'array';
         else if (value === null) type = 'object';

        return { path, type, value: String(value) };
    });

    return { ...result, flattenedData: flattenedWithTypes };
}
