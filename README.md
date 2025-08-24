# Building a Crypto Price Checker with Tambo AI

This guide will walk you through creating a cryptocurrency price checker application using Tambo AI. By the end, you'll have an AI-powered chat interface that can fetch and display real-time crypto data.

## 🎯 What You'll Build

- **AI Chat Interface** that responds to crypto queries
- **Real-time Crypto Data** from CoinMarketCap API
- **Beautiful Crypto Cards** with price, change, market cap, and volume
- **Smart AI Tool** that fetches any cryptocurrency data

## 📋 Prerequisites

- Node.js 18+ installed
- Basic knowledge of React/Next.js
- CoinMarketCap API key (free tier available)
- Tambo API key (free tier available)

## 🚀 Step 1: Create the Tambo Project

```bash
# Create new Tambo project
npm create tambo-app@latest crypto-price-checker

# Navigate to project
cd crypto-price-checker

# Install dependencies
npm install
```

## 🔑 Step 2: Get Your API Keys

### Tambo API Key
1. Visit [tambo.co/dashboard](https://tambo.co/dashboard)
2. Sign up and get your API key

### CoinMarketCap API Key
1. Visit [coinmarketcap.com/api](https://coinmarketcap.com/api/)
2. Sign up for free API access
3. Get your API key from the dashboard

### Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_TAMBO_API_KEY=your-tambo-api-key-here
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key-here
```

## 💾 Step 3: Create API Routes

### Main Crypto API Route
Create `src/app/api/crypto/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY!,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Crypto API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency data' },
      { status: 500 }
    );
  }
}
```

### Crypto Listings API Route
Create `src/app/api/crypto/listings/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY!,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Crypto listings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency listings' },
      { status: 500 }
    );
  }
}
```

## 🔧 Step 4: Create the Crypto Data Service

Create `src/services/crypto-data.ts`:

```typescript
export interface CryptoInfo {
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
}

/**
 * Fetches current cryptocurrency information
 */
export async function getCurrentCryptoInfo(symbol: string): Promise<CryptoInfo> {
  try {
    const response = await fetch(`/api/crypto?symbol=${encodeURIComponent(symbol)}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    const cryptoData = data.data[symbol.toUpperCase()];
    
    if (!cryptoData) {
      throw new Error(`Cryptocurrency ${symbol} not found`);
    }

    const quote = cryptoData.quote.USD;
    
    return {
      symbol: cryptoData.symbol,
      name: cryptoData.name,
      current_price: quote.price,
      price_change_24h: quote.price_change_24h,
      price_change_percentage_24h: quote.percent_change_24h,
      market_cap: quote.market_cap,
      volume_24h: quote.volume_24h,
    };
  } catch (error) {
    console.error('Error fetching crypto info:', error);
    throw error;
  }
}

/**
 * Gets top cryptocurrencies from CoinMarketCap listings
 */
export async function getTopCryptocurrencies() {
  const response = await fetch('/api/crypto/listings');
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.data.slice(0, 10).map((crypto: any) => ({
    symbol: crypto.symbol,
    name: crypto.name,
    current_price: crypto.quote.USD.price,
    price_change_24h: crypto.quote.USD.price_change_24h,
    price_change_percentage_24h: crypto.quote.USD.percent_change_24h,
    market_cap: crypto.quote.USD.market_cap,
    volume_24h: crypto.quote.USD.volume_24h,
  }));
}
```

## 🎨 Step 5: Create the Crypto Card Component

Create `src/components/crypto/CryptoCard.tsx`:

```typescript
"use client";

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
  currentPrice: z.number().optional().describe("Current price in USD"),
  current_price: z.number().optional().describe("Current price in USD (snake_case)"),
  priceChange24h: z.number().optional().describe("24h price change in USD"),
  price_change_24h: z.number().optional().describe("24h price change in USD (snake_case)"),
  priceChangePercentage24h: z.number().optional().describe("24h price change percentage"),
  price_change_percentage_24h: z.number().optional().describe("24h price change percentage (snake_case)"),
  marketCap: z.number().optional().describe("Market cap in USD"),
  market_cap: z.number().optional().describe("Market cap in USD (snake_case)"),
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
```

## 🔗 Step 6: Register the Tool and Component

Update `src/lib/tambo.ts`:

```typescript
import { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import { CryptoCard, cryptoCardSchema } from "@/components/crypto/CryptoCard";
import { getCurrentCryptoInfo } from "@/services/crypto-data";

/**
 * Tools - Functions that AI can call
 */
export const tools: TamboTool[] = [
  {
    name: "getCryptoPrice",
    description:
      "Fetches current cryptocurrency price and information for any valid crypto symbol (e.g., BTC, ETH, ADA, SOL). Displays it as a professional card with price, 24h change, market cap, and volume. Use this when users ask for crypto prices or current market data.",
    tool: async (args: { symbol: string }) => {
      try {
        const { symbol } = args;
        
        if (!symbol || typeof symbol !== 'string') {
          throw new Error('Invalid symbol provided');
        }
        
        const cryptoInfo = await getCurrentCryptoInfo(symbol);
        
        if (!cryptoInfo) {
          throw new Error('Failed to get current crypto information');
        }
        
        // Return data formatted for CryptoCard component
        return {
          symbol: cryptoInfo.symbol || symbol.toUpperCase(),
          name: cryptoInfo.name || symbol.toUpperCase(),
          currentPrice: cryptoInfo.current_price || 0,
          priceChange24h: cryptoInfo.price_change_24h || 0,
          priceChangePercentage24h: cryptoInfo.price_change_percentage_24h || 0,
          marketCap: cryptoInfo.market_cap || 0,
          volume24h: cryptoInfo.volume_24h || 0,
        };
      } catch (error) {
        console.error('Error in getCryptoPrice tool:', error);
        throw new Error(error instanceof Error ? error.message : "Failed to fetch crypto data");
      }
    },
    toolSchema: z
      .function()
      .args(
        z.object({
          symbol: z.string().describe("The cryptocurrency symbol (e.g., BTC, ETH, ADA)"),
        })
      )
      .returns(cryptoCardSchema),
  },
];

/**
 * Components - React components that AI can render
 */
export const components: TamboComponent[] = [
  {
    name: "CryptoCard",
    description:
      "A professional cryptocurrency information card that displays current price, 24h change, market cap, and trading volume with beautiful styling and color-coded price movements.",
    component: CryptoCard,
    propsSchema: cryptoCardSchema,
  },
];
```

## 💬 Step 7: Set Up Chat Interface

The Tambo template already includes chat components. Make sure your `src/app/chat/page.tsx` exists:

```typescript
"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
        tools={tools}
      >
        <div className="w-full max-w-4xl mx-auto">
          <MessageThreadFull contextKey="crypto-chat" />
        </div>
      </TamboProvider>
    </div>
  );
}
```

## 🚀 Step 8: Run Your Application

```bash
npm run dev
```

Visit `http://localhost:3000/chat` and start asking about crypto!

## 🧪 Step 9: Test Your Crypto AI

Try these prompts in your chat:

1. **"Show me the current price of Bitcoin"**
2. **"What's the price of ETH?"**
3. **"Get me information about Solana"**
4. **"Show me ADA price and market cap"**
5. **"What's the current price of DOGE?"**

## 🎯 Key Features Implemented

✅ **Real-time crypto data** from CoinMarketCap API  
✅ **Beautiful crypto cards** with price, change, market cap, volume  
✅ **Color-coded price movements** (green for gains, red for losses)  
✅ **Professional formatting** for large numbers (K, M, B, T)  
✅ **Error handling** for invalid crypto symbols  
✅ **Responsive design** that works on all devices  
✅ **AI-powered** natural language interface  

## 🔧 Customization Options

### Adding More Crypto Features
- Historical price charts
- Portfolio tracking
- Price alerts
- Trending cryptocurrencies

### Styling Customizations
- Dark mode support
- Different color themes
- Custom card layouts
- Animation effects

### Data Enhancements
- More market data (volume, supply, etc.)
- Price predictions
- News integration
- Social sentiment

## 🆘 Troubleshooting

**CoinMarketCap API Not Working:**
- Check your API key in `.env.local`
- Verify you haven't exceeded rate limits
- Make sure the API key has proper permissions

**Crypto Card Not Displaying:**
- Check browser console for API errors
- Verify the crypto symbol is valid
- Ensure your component is properly registered

**Chat Interface Issues:**
- Make sure TamboProvider wraps your chat component
- Check that your Tambo API key is correct
- Restart dev server after environment changes

## 🎉 Congratulations!

You now have a fully functional AI-powered crypto price checker! Your users can ask for any cryptocurrency in natural language and get beautiful, real-time data cards.

## 🔗 Next Steps

1. **Add More Cryptocurrencies**: Support for DeFi tokens, NFTs, etc.
2. **Add Charts**: Historical price visualization
3. **Portfolio Features**: Track multiple cryptos
4. **Alerts**: Price notifications
5. **Deploy**: Put it live on Vercel or Netlify

Happy crypto trading! 🚀📈
