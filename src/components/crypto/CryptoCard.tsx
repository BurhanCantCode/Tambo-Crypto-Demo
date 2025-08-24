"use client";

import { CryptoInfo } from "@/services/crypto-data";
import { z } from "zod";

export interface CryptoCardProps {
  symbol: string;
  name: string;
  currentPrice?: number;
  current_price?: number;
  priceChange24h?: number;
  price_change_24h?: number;
  priceChangePercentage24h?: number;
  price_change_percentage_24h?: number;
  marketCap?: number;
  market_cap?: number;
  volume24h?: number;
  volume_24h?: number;
}

export const cryptoCardSchema = z.object({
  symbol: z.string().describe("Cryptocurrency symbol (e.g., BTC)"),
  name: z.string().describe("Cryptocurrency name (e.g., Bitcoin)"),
  // Allow both naming conventions for price
  currentPrice: z.number().optional().describe("Current price in USD"),
  current_price: z.number().optional().describe("Current price in USD (snake_case)"),
  // Allow both naming conventions for price change
  priceChange24h: z.number().optional().describe("24h price change in USD"),
  price_change_24h: z.number().optional().describe("24h price change in USD (snake_case)"),
  // Allow both naming conventions for price change percentage
  priceChangePercentage24h: z.number().optional().describe("24h price change percentage"),
  price_change_percentage_24h: z.number().optional().describe("24h price change percentage (snake_case)"),
  // Allow both naming conventions for market cap
  marketCap: z.number().optional().describe("Market cap in USD"),
  market_cap: z.number().optional().describe("Market cap in USD (snake_case)"),
  // Allow both naming conventions for volume
  volume24h: z.number().optional().describe("24h trading volume in USD"),
  volume_24h: z.number().optional().describe("24h trading volume in USD (snake_case)"),
}).refine(
  (data) => (data.currentPrice !== undefined || data.current_price !== undefined),
  { message: "Either currentPrice or current_price must be provided" }
).refine(
  (data) => (data.priceChangePercentage24h !== undefined || data.price_change_percentage_24h !== undefined),
  { message: "Either priceChangePercentage24h or price_change_percentage_24h must be provided" }
);

export function CryptoCard({
  symbol,
  name,
  currentPrice,
  current_price,
  priceChange24h,
  price_change_24h,
  priceChangePercentage24h,
  price_change_percentage_24h,
  marketCap,
  market_cap,
  volume24h,
  volume_24h
}: CryptoCardProps) {
  // Normalize props to handle both naming conventions
  const price = currentPrice ?? current_price;
  const priceChange = priceChange24h ?? price_change_24h;
  const priceChangePercentage = priceChangePercentage24h ?? price_change_percentage_24h;
  const marketCapValue = marketCap ?? market_cap;
  const volumeValue = volume24h ?? volume_24h;

  // Validate all required props
  if (!symbol || !name || price === undefined || priceChangePercentage === undefined) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-red-600">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p>Missing required crypto information: {symbol} - {name}</p>
          <div className="text-sm mt-2 text-gray-500">
            <p>Price: {price}, Change: {priceChangePercentage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine colors based on price change
  const isPositive = priceChangePercentage >= 0;
  const changeColor = isPositive ? '#22c55e' : '#ef4444';
  const bgGradient = isPositive 
    ? 'from-green-50 to-emerald-50' 
    : 'from-red-50 to-rose-50';
  const borderColor = isPositive ? 'border-green-200' : 'border-red-200';
  
  // Format large numbers with null safety
  const formatLargeNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return 'N/A';
    }
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className={`w-full max-w-2xl mx-auto bg-gradient-to-br ${bgGradient} rounded-xl border-2 ${borderColor} shadow-lg overflow-hidden`}>
      {/* Main price section */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {name}
            </h2>
            <div className="text-lg text-gray-600 font-medium">
              {symbol.toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: price > 1 ? 2 : 8
              })}
            </div>
            <div 
              className="flex items-center justify-end gap-2 text-xl font-semibold"
              style={{ color: changeColor }}
            >
              <span className="text-2xl">
                {isPositive ? '▲' : '▼'}
              </span>
              <span>
                {priceChange && priceChange > 0 ? '+' : ''}
                ${priceChange ? Math.abs(priceChange).toFixed(2) : 'N/A'}
              </span>
              <span>
                ({priceChangePercentage > 0 ? '+' : ''}
                {priceChangePercentage.toFixed(2)}%)
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              24h Change
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600 font-medium mb-1">
              Market Cap
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatLargeNumber(marketCapValue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 font-medium mb-1">
              24h Volume
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatLargeNumber(volumeValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-white/50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Powered by CoinMarketCap</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

