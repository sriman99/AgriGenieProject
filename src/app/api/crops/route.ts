import { NextResponse } from 'next/server';

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const DATA_GOV_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export async function GET() {
  try {
    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY!,
      'format': 'json',
      'limit': '1000'
    });

    const response = await fetch(`${DATA_GOV_API_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch data from Data.gov API');

    const data = await response.json();
    const records = data.records || [];

    // Extract unique crop names
    const crops = [...new Set(records.map((record: any) => record.crop_name))].sort();

    return NextResponse.json(crops);
  } catch (error) {
    console.error('Error in crops API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crops' },
      { status: 500 }
    );
  }
} 