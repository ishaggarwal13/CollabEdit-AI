
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ApiProvider } from '@/lib/api-providers';
import { defaultProviders } from '@/lib/api-providers';

interface ApiProviderContextType {
    providers: ApiProvider[];
    setProviders: (providers: ApiProvider[]) => void;
    getProviderById: (id?: string) => ApiProvider | undefined;
}

const ApiProviderContext = createContext<ApiProviderContextType | undefined>(undefined);

export function useApiProviders() {
    const context = useContext(ApiProviderContext);
    if (!context) {
        throw new Error('useApiProviders must be used within an ApiProviderProvider');
    }
    return context;
}

export function ApiProviderProvider({ children }: { children: ReactNode }) {
    const [providers, setProviders] = useState<ApiProvider[]>(defaultProviders);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (isClient) {
            try {
                const savedProvidersJSON = localStorage.getItem('api-providers');
                if (savedProvidersJSON) {
                    const savedProviders = JSON.parse(savedProvidersJSON);
                    
                    const mergedProviders = defaultProviders.map(dp => {
                        const saved = savedProviders.find((sp: ApiProvider) => sp.id === dp.id);
                        return saved ? { ...dp, ...saved } : dp;
                    });

                    const customProviders = savedProviders.filter((sp: ApiProvider) => !defaultProviders.some(dp => dp.id === sp.id));
                    
                    setProviders([...mergedProviders, ...customProviders]);

                } else {
                    setProviders(defaultProviders);
                }
            } catch (error) {
                console.error("Failed to load API providers from local storage", error);
                setProviders(defaultProviders);
            }
        }
    }, [isClient]);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('api-providers', JSON.stringify(providers));
            } catch (error) {
                console.error("Failed to save API providers to local storage", error);
            }
        }
    }, [providers, isClient]);

    const getProviderById = useCallback((id?: string) => {
        if (!id) return undefined;
        return providers.find(p => p.id === id);
    }, [providers]);

    return (
        <ApiProviderContext.Provider value={{ providers, setProviders, getProviderById }}>
            {children}
        </ApiProviderContext.Provider>
    );
}
