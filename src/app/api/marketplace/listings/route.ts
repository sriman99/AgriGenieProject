import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { 
  getMarketplaceListings, 
  getMarketplaceListing,
  createMarketplaceListing,
  updateMarketplaceListing,
  deleteMarketplaceListing
} from '@/lib/marketplace-api';

// GET /api/marketplace/listings - Get all listings or filter by query params
export async function GET(request: Request) {
  try {
    // Extract query parameters for filtering
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const minPrice = url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')!) : undefined;
    const maxPrice = url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')!) : undefined;
    const search = url.searchParams.get('search') || undefined;
    const listingId = url.searchParams.get('id') || undefined;

    // If id is provided, get a single listing
    if (listingId) {
      const { data, error } = await getMarketplaceListing(listingId);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      if (!data) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      
      return NextResponse.json(data);
    }

    // Otherwise, get listings with optional filters
    const { data, error } = await getMarketplaceListings({
      category,
      minPrice,
      maxPrice,
      search
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error in marketplace listings GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/marketplace/listings - Create a new listing
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get user profile to verify it's a farmer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, full_name')
      .eq('id', userId)
      .single();
    
    if (!profile || profile.user_type !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can create listings' }, { status: 403 });
    }

    const body = await request.json();
    
    // Add farmer ID and name to the listing
    const listingData = {
      ...body,
      farmerId: userId,
      farmerName: profile.full_name || 'Farmer',
    };

    const { data, error } = await createMarketplaceListing(listingData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in marketplace listings POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/marketplace/listings - Update an existing listing
export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Get the existing listing to verify ownership
    const { data: listing } = await getMarketplaceListing(id);
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Make sure the user owns this listing
    if (listing.farmerId !== userId) {
      return NextResponse.json({ error: 'You can only update your own listings' }, { status: 403 });
    }

    const { data, error } = await updateMarketplaceListing(id, updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in marketplace listings PATCH:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/marketplace/listings - Delete a listing
export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get the listing ID from query params
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Get the existing listing to verify ownership
    const { data: listing } = await getMarketplaceListing(id);
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Make sure the user owns this listing
    if (listing.farmerId !== userId) {
      return NextResponse.json({ error: 'You can only delete your own listings' }, { status: 403 });
    }

    const { success, error } = await deleteMarketplaceListing(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error in marketplace listings DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}