import { NextResponse } from 'next/server';

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const DATA_GOV_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop') || searchParams.get('commodity');
    const market = searchParams.get('market');
    const state = searchParams.get('state');

    // Build the API URL with parameters
    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY!,
      'format': 'json',
      'limit': '100'
    });

    // Add filters if provided
    if (crop) params.append('filters[crop_name]', crop);
    if (market) params.append('filters[market]', market);
    if (state) params.append('filters[state]', state);

    const response = await fetch(`${DATA_GOV_API_URL}?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch data from Data.gov API');
    }

    const data = await response.json();
    const records = data.records || [];

    if (records.length === 0) {
      return NextResponse.json([]);
    }

    // Transform the data to match our CropPrice interface
    const transformedData = records.map((record: any, index: number) => {
      const modalPrice = parseFloat(record.modal_price) || 0;
      const minPrice = parseFloat(record.min_price) || 0;
      const maxPrice = parseFloat(record.max_price) || 0;

      // Calculate price trend and percent change
      let priceTrend: 'rising' | 'falling' | 'stable' = 'stable';
      let percentChange = 0;

      if (index > 0) {
        const prevPrice = parseFloat(records[index - 1].modal_price) || 0;
        if (modalPrice > prevPrice) {
          priceTrend = 'rising';
          percentChange = ((modalPrice - prevPrice) / prevPrice) * 100;
        } else if (modalPrice < prevPrice) {
          priceTrend = 'falling';
          percentChange = ((prevPrice - modalPrice) / prevPrice) * 100;
        }
      }

      return {
        id: record._id || index.toString(),
        crop_name: record.crop_name,
        price_per_kg: modalPrice,
        market_name: record.market,
        state: record.state,
        last_updated: record.arrival_date,
        price_trend: priceTrend,
        percent_change: parseFloat(percentChange.toFixed(1)),
        min_price: minPrice,
        max_price: maxPrice,
        quantity: parseFloat(record.quantity) || 0
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in market-prices API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market prices' },
      { status: 500 }
    );
  }
} 