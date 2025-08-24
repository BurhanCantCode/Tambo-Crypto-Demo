/**
 * @file crypto-data.ts
 * @description Service for fetching cryptocurrency data from CoinMarketCap API
 */

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
 * @param symbol - The cryptocurrency symbol (e.g., BTC, ETH)
 * @returns Current crypto information
 */
export async function getCurrentCryptoInfo(symbol: string): Promise<CryptoInfo> {
  try {
    // Use our API route to avoid CORS issues
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
 * @returns Array of top cryptocurrencies with current data
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


