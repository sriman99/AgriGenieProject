import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const commodity = searchParams.get('commodity');

  if (!state || !commodity) {
    return NextResponse.json(
      { error: 'State and commodity are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `http://localhost:8000/plot-price-trend/?state=${state}&commodity=${commodity}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price trend');
    }

    const data = await response.text();
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch price trend' },
      { status: 500 }
    );
  }
} 