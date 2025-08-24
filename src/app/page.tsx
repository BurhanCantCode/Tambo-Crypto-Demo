import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import Image from "next/image";

const CryptoFeaturesSection = () => (
  <div className="bg-gradient-to-br from-slate-50 to-blue-50 px-8 py-6 rounded-lg border">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      <span>🚀</span>
      What You Can Do:
    </h2>
    <ul className="space-y-4 text-gray-700">
      <li className="flex items-start gap-3">
        <span className="text-2xl">📈</span>
        <div>
          <div className="font-medium">Interactive Price Charts</div>
          <div className="text-sm text-gray-600">Ask for any cryptocurrency chart with natural language</div>
        </div>
      </li>
      <li className="flex items-start gap-3">
        <span className="text-2xl">💰</span>
        <div>
          <div className="font-medium">Real-time Price Data</div>
          <div className="text-sm text-gray-600">Get current prices and 24h changes for any crypto</div>
        </div>
      </li>
      <li className="flex items-start gap-3">
        <span className="text-2xl">🔍</span>
        <div>
          <div className="font-medium">Smart Search</div>
          <div className="text-sm text-gray-600">Search cryptocurrencies by name or symbol</div>
        </div>
      </li>
      <li className="flex items-start gap-3">
        <span className="text-2xl">⏱️</span>
        <div>
          <div className="font-medium">Multiple Timeframes</div>
          <div className="text-sm text-gray-600">View charts for 7 days, 30 days, 90 days, or 1 year</div>
        </div>
      </li>
    </ul>
    
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      <h3 className="font-medium text-blue-900 mb-2">Try these examples:</h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• "Give me a BTC chart for the last month"</li>
        <li>• "Show me Ethereum price for the last 7 days"</li>
        <li>• "What's the current price of Solana?"</li>
        <li>• "Compare Bitcoin and Ethereum charts"</li>
      </ul>
      <div className="mt-3 p-2 bg-amber-50 rounded border-l-2 border-amber-400">
        <p className="text-xs text-amber-800">
          <strong>Note:</strong> Charts use realistic demo data based on current prices. 
          Historical data requires CoinMarketCap Professional+ plan.
        </p>
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="text-6xl mb-4">₿</div>
          <h1 className="text-4xl text-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crypto Price Checker
          </h1>
          <p className="text-lg text-gray-600 mt-2 text-center">
            AI-powered cryptocurrency charts and price data
          </p>
        </div>

        <div className="w-full space-y-8">
          <div className="bg-white px-8 py-4">
            <h2 className="text-xl font-semibold mb-4">Setup Checklist</h2>
            <ApiKeyCheck>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="/chat"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  Start Trading Chat 🚀
                </a>
                <a
                  href="/interactables"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                >
                  Demo & Examples 📊
                </a>
              </div>
            </ApiKeyCheck>
          </div>

          <CryptoFeaturesSection />
        </div>
      </main>
    </div>
  );
}
