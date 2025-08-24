# 🤖 AI Crypto Price Checker with Tambo

A beginner-friendly guide to building an AI-powered cryptocurrency price checker using Tambo AI. Chat with AI to get real-time crypto data!

## 🧠 What is Tambo AI?

**Tambo AI** is a framework that lets you create AI applications that can:
- **Chat naturally** with users
- **Call functions** (called "tools") to fetch data
- **Render UI components** dynamically based on AI responses

Think of it like giving your AI superpowers - instead of just chatting, it can actually DO things like fetch crypto prices, display charts, and more!

### Key Concepts:

**🛠️ Tools** = Functions your AI can call
- Example: `getCryptoPrice()` - fetches Bitcoin price data

**🎨 Components** = UI elements your AI can display  
- Example: `CryptoCard` - shows crypto price in a beautiful card

**💬 Chat Interface** = Where users talk to your AI
- Users ask: "What's Bitcoin's price?"
- AI calls the tool, gets data, shows component

## 🎯 What You'll Build

- **Smart AI Chat** that understands crypto queries
- **Real-time Price Data** from CoinMarketCap API  
- **Beautiful Crypto Cards** with prices, changes, market data
- **Natural Language Interface** - just ask for any crypto!

## 📋 Prerequisites

- Node.js 18+ installed
- Basic knowledge of React/Next.js
- 10 minutes of your time ⏰

## 🚀 Step 1: Create Your Project

```bash
# Create new Tambo project
npm create tambo-app@latest crypto-price-checker

# Navigate to project
cd crypto-price-checker

# Install dependencies
npm install
```

## 🔑 Step 2: Get Your API Keys

### Tambo API Key (Free!)
1. Visit [tambo.co/dashboard](https://tambo.co/dashboard)
2. Sign up and get your API key

### CoinMarketCap API Key (Free!)
1. Visit [coinmarketcap.com/api](https://coinmarketcap.com/api/)
2. Sign up for free API access
3. Get your API key from the dashboard

### Configure Environment
Create `.env.local` in your project root:
```env
NEXT_PUBLIC_TAMBO_API_KEY=your-tambo-api-key-here
NEXT_PUBLIC_COINMARKETCAP_API_KEY=your-coinmarketcap-api-key-here
```

## 💾 Step 3: Create the Crypto API

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

## 🔧 Step 4: Create the Data Service

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
```

## 🎨 Step 5: Create the Crypto Card Component

Create `src/components/crypto/CryptoCard.tsx`:

```typescript
"use client";

import { z } from "zod";

export interface CryptoCardProps {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
}

export const cryptoCardSchema = z.object({
  symbol: z.string().describe("Cryptocurrency symbol (e.g., BTC)"),
  name: z.string().describe("Cryptocurrency name (e.g., Bitcoin)"),
  currentPrice: z.number().describe("Current price in USD"),
  priceChange24h: z.number().describe("24h price change in USD"),
  priceChangePercentage24h: z.number().describe("24h price change percentage"),
  marketCap: z.number().describe("Market cap in USD"),
  volume24h: z.number().describe("24h trading volume in USD"),
});

export function CryptoCard({
  symbol,
  name,
  currentPrice,
  priceChange24h,
  priceChangePercentage24h,
  marketCap,
  volume24h
}: CryptoCardProps) {
  // Determine colors based on price change
  const isPositive = priceChangePercentage24h >= 0;
  const changeColor = isPositive ? '#22c55e' : '#ef4444';
  const bgGradient = isPositive 
    ? 'from-green-50 to-emerald-50' 
    : 'from-red-50 to-rose-50';
  const borderColor = isPositive ? 'border-green-200' : 'border-red-200';
  
  // Format large numbers
  const formatLargeNumber = (num: number): string => {
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
              ${currentPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: currentPrice > 1 ? 2 : 8
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
                {priceChange24h > 0 ? '+' : ''}${Math.abs(priceChange24h).toFixed(2)}
              </span>
              <span>
                ({priceChangePercentage24h > 0 ? '+' : ''}{priceChangePercentage24h.toFixed(2)}%)
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
              {formatLargeNumber(marketCap)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 font-medium mb-1">
              24h Volume
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatLargeNumber(volume24h)}
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

## 🎯 Step 6: Register Your AI Tool & Component

Update `src/lib/tambo.ts`:

```typescript
import { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import { CryptoCard, cryptoCardSchema } from "@/components/crypto/CryptoCard";
import { getCurrentCryptoInfo } from "@/services/crypto-data";

/**
 * 🛠️ TOOLS - Functions your AI can call
 * 
 * Think of tools as superpowers you give to your AI.
 * When users ask for crypto prices, the AI will automatically
 * call the getCryptoPrice tool to fetch real data.
 */
export const tools: TamboTool[] = [
  {
    name: "getCryptoPrice",
    description: "Fetches current cryptocurrency price and information for any valid crypto symbol (e.g., BTC, ETH, ADA, SOL). Use this when users ask for crypto prices or market data.",
    tool: async (args: { symbol: string }) => {
      try {
        const { symbol } = args;
        
        if (!symbol || typeof symbol !== 'string') {
          throw new Error('Invalid symbol provided');
        }
        
        console.log('Fetching crypto price for:', symbol);
        
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
 * 🎨 COMPONENTS - UI elements your AI can display
 * 
 * Components are the visual pieces your AI can show to users.
 * When the AI gets crypto data, it will automatically display
 * it using the beautiful CryptoCard component.
 */
export const components: TamboComponent[] = [
  {
    name: "CryptoCard",
    description: "A beautiful cryptocurrency information card that displays current price, 24h change, market cap, and trading volume with color-coded price movements.",
    component: CryptoCard,
    propsSchema: cryptoCardSchema,
  },
];
```

## 💬 Step 7: Chat Interface Setup

Your Tambo project already includes chat components! Make sure your `src/app/chat/page.tsx` looks like this:

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

## 🚀 Step 8: Run & Test

```bash
# Start your app
npm run dev
```

Visit `http://localhost:3000/chat` and try these commands:

- **"Show me Bitcoin's price"**
- **"What's ETH worth right now?"**  
- **"Get me Solana information"**
- **"How's DOGE doing?"**

## 🎉 How It All Works Together

1. **User asks**: "What's Bitcoin's price?"
2. **AI understands** and calls the `getCryptoPrice` tool with `symbol: "BTC"`
3. **Tool fetches** real data from CoinMarketCap API
4. **AI displays** the data using the `CryptoCard` component
5. **User sees** a beautiful card with current Bitcoin price! 

## ✨ What Makes This Special

✅ **Natural Language** - Ask in any way you want  
✅ **Real-time Data** - Always current prices  
✅ **Beautiful UI** - Professional crypto cards  
✅ **Smart AI** - Understands crypto symbols automatically  
✅ **Error Handling** - Graceful handling of invalid cryptos  

## 🔧 Next Steps & Ideas

**🚀 Enhance Your App:**
- Add price charts and historical data
- Create a portfolio tracker
- Set up price alerts
- Add more cryptocurrencies
- Deploy to production

**🎨 Customize:**
- Change card designs and colors
- Add dark mode
- Create different chart types
- Add animations

## 🆘 Troubleshooting

**API Not Working?**
- Check your `.env.local` file has both API keys
- Restart your dev server after adding keys
- Make sure you haven't hit API rate limits

**Component Not Showing?**
- Check browser console for errors
- Verify the crypto symbol is valid (BTC, ETH, etc.)
- Make sure TamboProvider wraps your chat component

## 🎯 Congratulations!

You've built an AI-powered crypto price checker! Your AI can now:
- Understand natural language requests
- Fetch real-time crypto data
- Display beautiful, interactive components

Welcome to the future of AI applications! 🤖🚀

---

*Happy crypto trading! 📈*