import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`,
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
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency data' },
      { status: 500 }
    );
  }
}

