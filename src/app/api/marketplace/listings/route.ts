import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-helpers';

// GET /api/marketplace/listings - Get all listings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const availableOnly = searchParams.get('available_only') !== 'false';
    const cropName = searchParams.get('crop_name');
    const farmerOnly = searchParams.get('farmer_only') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    // Create supabase client
    const supabase = createClient();
    
    // If farmerOnly is true, we need to authenticate the user
    if (farmerOnly) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('GET listings: Farmer-only filter requires authentication');
        return NextResponse.json({ error: 'Authentication required for farmer-only listings' }, { status: 401 });
      }
      
      console.log('GET listings: Authenticated user for farmer-only filter:', user.id);
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
      // Get the authenticated user to filter by farmer_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Only return listings by the current user if they are a farmer
        query = query.eq('farmer_id', user.id);
      }
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
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    
    // Create supabase client
    const supabase = createClient();
    
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
}); 