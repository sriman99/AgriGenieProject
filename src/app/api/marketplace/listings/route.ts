import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/marketplace/listings - Get all listings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const availableOnly = searchParams.get('available_only') !== 'false';
    const cropName = searchParams.get('crop_name');
    const farmerOnly = searchParams.get('farmer_only') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Construct query
    let query = supabase
      .from('crop_listings')
      .select(`
        *,
        farmer:profiles!crop_listings_farmer_id_fkey(full_name)
      `);
    
    if (availableOnly) {
      query = query.eq('available', true);
    }
    
    if (cropName) {
      query = query.eq('crop_name', cropName);
    }
    
    if (farmerOnly) {
      // Only return listings by the current user if they are a farmer
      query = query.eq('farmer_id', user.id);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    // Order by most recent
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in listings API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/marketplace/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile to check if they are a farmer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.user_type !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can create listings' }, { status: 403 });
    }
    
    // Create the listing
    const listingData = {
      farmer_id: user.id,
      crop_name: body.crop_name,
      quantity: body.quantity,
      price_per_unit: body.price_per_unit,
      unit: body.unit,
      description: body.description,
      available: true
    };
    
    const { data, error } = await supabase
      .from('crop_listings')
      .insert(listingData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in create listing API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 