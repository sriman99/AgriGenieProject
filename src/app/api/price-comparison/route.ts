import { NextResponse } from 'next/server';

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const DATA_GOV_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop');

    if (!crop) {
      return NextResponse.json(
        { error: 'Crop parameter is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY!,
      'format': 'json',
      'filters[crop_name]': crop,
      'limit': '1000'
    });

    const response = await fetch(`${DATA_GOV_API_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch data from Data.gov API');

    const data = await response.json();
    const records = data.records || [];

    // Group prices by market and calculate average price
    const marketPrices = records.reduce((acc: { [key: string]: { total: number; count: number } }, record: any) => {
      const market = record.market;
      const price = parseFloat(record.modal_price) || 0;
      
      if (!acc[market]) {
        acc[market] = { total: 0, count: 0 };
      }
      
      acc[market].total += price;
      acc[market].count += 1;
      
      return acc;
    }, {});

    // Calculate average price for each market
    const priceComparison = Object.entries(marketPrices as Record<string, { total: number; count: number }>).map(([market, data]) => ({
      market,
      price: parseFloat((data.total / data.count).toFixed(2))
    }));

    // Sort by price in descending order
    priceComparison.sort((a, b) => b.price - a.price);

    return NextResponse.json(priceComparison);
  } catch (error) {
    console.error('Error in price-comparison API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price comparison' },
      { status: 500 }
    );
  }
} 