
import type { Widget } from '@/app/page';
import { Briefcase, Zap, TrendingUp, CircleDollarSign, Globe, Shield, Newspaper } from 'lucide-react';

export interface Template {
  name: string;
  icon: JSX.Element;
  description: string;
  widgetExamples: string[];
  widgets: Omit<Widget, 'id'>[];
}

export const templates: Template[] = [
  {
    name: 'Beginner',
    icon: <Briefcase className="inline-block h-5 w-5 mr-1" />,
    description: 'A simple dashboard with basic stock cards and a table for trending stocks.',
    widgetExamples: ['Apple & Tesla Stock Cards', 'Top 5 Trending Stocks Table', 'Apple Daily Price Chart'],
    widgets: [
      {
        componentName: 'KeyMetricsWidget',
        title: 'Apple (AAPL)',
        config: { cardType: 'watchlist', symbol: 'AAPL', apiProvider: 'alpha-vantage' },
        layout: { lg: { i: '', x: 0, y: 0, w: 3, h: 4 } },
      },
      {
        componentName: 'KeyMetricsWidget',
        title: 'Tesla (TSLA)',
        config: { cardType: 'watchlist', symbol: 'TSLA', apiProvider: 'alpha-vantage' },
        layout: { lg: { i: '', x: 3, y: 0, w: 3, h: 4 } },
      },
      {
        componentName: 'DataTableWidget',
        title: 'Top 5 Trending Stocks',
        config: { dataSource: 'custom', customApiEndpoint: 'https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo', arrayDataPath: 'top_gainers', selectedFields: [{path: 'ticker', label: 'Ticker'}, {path: 'price', label: 'Price'}, {path: 'change_percentage', label: 'Change %'}] },
        layout: { lg: { i: '', x: 6, y: 0, w: 6, h: 5 } },
      },
      {
        componentName: 'StockChartWidget',
        title: 'Apple (AAPL) - Daily',
        config: { chartType: 'line', timeInterval: 'daily', symbol: 'AAPL', apiProvider: 'alpha-vantage' },
        layout: { lg: { i: '', x: 0, y: 4, w: 6, h: 4 } },
      },
    ],
  },
  {
    name: 'Day Trader',
    icon: <Zap className="inline-block h-5 w-5 mr-1" />,
    description: 'For active traders needing real-time candlestick charts, watchlists, and news.',
    widgetExamples: ['Real-time Candlestick Chart (TSLA)', 'Watchlist Table', 'News Ticker', 'RSI + MA Indicators'],
    widgets: [
        {
            componentName: 'StockChartWidget',
            title: 'Tesla (TSLA) - 1min',
            config: { chartType: 'candle', timeInterval: 'intraday', symbol: 'TSLA', refreshInterval: '60', apiProvider: 'alpha-vantage' },
            layout: { lg: { i: '', x: 0, y: 0, w: 8, h: 6 } },
        },
        {
            componentName: 'DataTableWidget',
            title: 'Watchlist',
            config: { dataSource: 'custom', customApiEndpoint: 'https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo', arrayDataPath: 'most_actively_traded', selectedFields: [{path: 'ticker', label: 'Ticker'}, {path: 'price', label: 'Price'}, {path: 'change_percentage', label: 'Change %'}] },
            layout: { lg: { i: '', x: 8, y: 0, w: 4, h: 6 } },
        },
    ]
  },
  {
    name: 'Long-Term Investor',
    icon: <TrendingUp className="inline-block h-5 w-5 mr-1" />,
    description: 'Focus on portfolio overviews, historical performance, and dividend tracking.',
    widgetExamples: ['Portfolio Sector Split', '10-Year Historical Chart (MSFT)', 'Dividend Tracker', 'S&P 500 Index Card'],
    widgets: [
      {
        componentName: 'KeyMetricsWidget',
        title: 'S&P 500 Index',
        config: { cardType: 'watchlist', symbol: 'SPY', apiProvider: 'alpha-vantage' },
        layout: { lg: { i: '', x: 4, y: 0, w: 4, h: 4 } },
      },
      {
        componentName: 'StockChartWidget',
        title: 'Microsoft (MSFT) - Monthly',
        config: { chartType: 'line', timeInterval: 'monthly', symbol: 'MSFT', apiProvider: 'alpha-vantage' },
        layout: { lg: { i: '', x: 0, y: 2, w: 8, h: 4 } },
      },
    ]
  },
  {
    name: 'Crypto Enthusiast',
    icon: <CircleDollarSign className="inline-block h-5 w-5 mr-1" />,
    description: 'Track crypto prices, view real-time charts, and gauge market sentiment.',
    widgetExamples: ['Crypto Price Cards (BTC, ETH)', 'Real-time Candlestick (BTC/USDT)', 'Fear & Greed Index', 'Top Gainers/Losers'],
    widgets: [
        {
            componentName: 'KeyMetricsWidget',
            title: 'Bitcoin (BTC)',
            config: { cardType: 'watchlist', symbol: 'BTCUSDT', apiProvider: 'finnhub' },
            layout: { lg: { i: '', x: 0, y: 0, w: 3, h: 4 } },
        },
        {
            componentName: 'KeyMetricsWidget',
            title: 'Ethereum (ETH)',
            config: { cardType: 'watchlist', symbol: 'ETHUSDT', apiProvider: 'finnhub' },
            layout: { lg: { i: '', x: 3, y: 0, w: 3, h: 4 } },
        },
        {
            componentName: 'StockChartWidget',
            title: 'BTC/USDT',
            config: { chartType: 'candle', timeInterval: 'daily', symbol: 'BINANCE:BTCUSDT', apiProvider: 'finnhub' },
            layout: { lg: { i: '', x: 0, y: 2, w: 9, h: 5 } },
        },
    ]
  },
  {
    name: 'Global Markets',
    icon: <Globe className="inline-block h-5 w-5 mr-1" />,
    description: 'Monitor currency exchange rates, commodities, and global indices.',
    widgetExamples: ['Currency Exchange Card', 'Commodity Tracker', 'Global Indices Table', 'Country Performance Heatmap'],
    widgets: [
        {
            componentName: 'KeyMetricsWidget',
            title: 'USD/INR Exchange',
            config: { cardType: 'forex', from: 'USD', to: 'INR', apiProvider: 'alpha-vantage' },
            layout: { lg: { i: '', x: 0, y: 0, w: 3, h: 4 } },
        },
        {
            componentName: 'KeyMetricsWidget',
            title: 'Gold Price (XAU)',
            config: { cardType: 'watchlist', symbol: 'GOLD', apiProvider: 'alpha-vantage'},
            layout: { lg: { i: '', x: 3, y: 0, w: 3, h: 4 } },
        },
        {
            componentName: 'DataTableWidget',
            title: 'Global Indices',
            config: { dataSource: 'custom', customApiEndpoint: 'https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo', arrayDataPath: 'most_actively_traded' },
            layout: { lg: { i: '', x: 6, y: 0, w: 6, h: 5 } },
        },
    ]
  },
];
