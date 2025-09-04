
export type ApiEndpoint = {
    name: string;
    path: string;
}

export interface ApiProvider {
  id: string;
  name: string;
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  endpoints: ApiEndpoint[];
}

export const defaultProviders: ApiProvider[] = [
    {
        id: 'alpha-vantage',
        name: 'Alpha Vantage',
        enabled: false,
        baseUrl: 'https://www.alphavantage.co/query',
        apiKey: '',
        endpoints: [
            { name: 'quote', path: '?function=GLOBAL_QUOTE&symbol={symbol}&apikey={apiKey}'},
            { name: 'search', path: '?function=SYMBOL_SEARCH&keywords={keywords}&apikey={apiKey}'},
            { name: 'intraday', path: '?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey={apiKey}'},
            { name: 'daily', path: '?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={apiKey}'},
            { name: 'forex', path: '?function=CURRENCY_EXCHANGE_RATE&from_currency={from}&to_currency={to}&apikey={apiKey}'},
        ]
    },
    {
        id: 'finnhub',
        name: 'Finnhub',
        enabled: false,
        baseUrl: 'https://finnhub.io/api/v1',
        apiKey: '',
        endpoints: [
            { name: 'quote', path: '/quote?symbol={symbol}&token={apiKey}'},
            { name: 'search', path: '/search?q={keywords}&token={apiKey}'},
            { name: 'candles', path: '/stock/candle?symbol={symbol}&resolution=D&from={from}&to={to}&token={apiKey}'},
            { name: 'crypto-candles', path: '/crypto/candle?symbol={symbol}&resolution=D&from={from}&to={to}&token={apiKey}'}
        ]
    }
]
