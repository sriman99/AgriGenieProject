import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/marketplace/listings/[id] - Get a specific listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the listing with the farmer's name
    const { data, error } = await supabase
      .from('crop_listings')
      .select(`
        *,
        farmer:profiles!crop_listings_farmer_id_fkey(full_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching listing:', error);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in get listing API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/marketplace/listings/[id] - Update a listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify this listing belongs to the current user
    const { data: listing, error: listingError } = await supabase
      .from('crop_listings')
      .select('farmer_id')
      .eq('id', id)
      .single();
    
    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    if (listing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'You can only update your own listings' }, { status: 403 });
    }
    
    // Create update data
    const updateData = {
      crop_name: body.crop_name,
      quantity: body.quantity,
      price_per_unit: body.price_per_unit,
      unit: body.unit,
      description: body.description,
      available: body.available
    };
    
    // Update the listing
    const { data, error } = await supabase
      .from('crop_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in update listing API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/marketplace/listings/[id] - Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify this listing belongs to the current user
    const { data: listing, error: listingError } = await supabase
      .from('crop_listings')
      .select('farmer_id')
      .eq('id', id)
      .single();
    
    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    if (listing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own listings' }, { status: 403 });
    }
    
    // Check if there are any orders associated with this listing
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('crop_listing_id', id);
    
    if (ordersError) {
      console.error('Error checking orders:', ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }
    
    if (orders && orders.length > 0) {
      // If there are orders, just mark it as unavailable instead of deleting
      const { error } = await supabase
        .from('crop_listings')
        .update({ available: false })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating listing availability:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Listing marked as unavailable because it has associated orders'
      });
    }
    
    // Delete the listing if no orders
    const { error } = await supabase
      .from('crop_listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error in delete listing API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}