import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Get top cryptocurrencies for trending data
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=20',
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
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
    console.error('Error fetching crypto listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency listings' },
      { status: 500 }
    );
  }
}
