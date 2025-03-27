import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/marketplace/orders - Get orders for the current user
export async function GET(request: NextRequest) {
  try {
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to determine user type
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    let query;
    
    if (profile.user_type === 'buyer') {
      // Buyers see their own orders
      query = supabase
        .from('orders')
        .select(`
          *,
          crop_listing:crop_listings(
            crop_name,
            unit,
            farmer:profiles!crop_listings_farmer_id_fkey(full_name)
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
    } else if (profile.user_type === 'farmer') {
      // Farmers see orders for their listings
      query = supabase
        .from('orders')
        .select(`
          *,
          crop_listing:crop_listings!orders_crop_listing_id_fkey(
            crop_name,
            unit
          ),
          buyer:profiles!orders_buyer_id_fkey(full_name)
        `)
        .eq('crop_listing.farmer_id', user.id)
        .order('created_at', { ascending: false });
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 403 });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in orders API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/marketplace/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile to check if they are a buyer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.user_type !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can place orders' }, { status: 403 });
    }
    
    // Get the listing
    const { data: listing, error: listingError } = await supabase
      .from('crop_listings')
      .select('*')
      .eq('id', body.crop_listing_id)
      .single();
    
    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    if (!listing.available) {
      return NextResponse.json({ error: 'This crop is no longer available' }, { status: 400 });
    }
    
    if (body.quantity > listing.quantity) {
      return NextResponse.json({ error: 'Order quantity exceeds available quantity' }, { status: 400 });
    }
    
    // Calculate total price
    const totalPrice = body.quantity * listing.price_per_unit;
    
    // Create the order
    const orderData = {
      buyer_id: user.id,
      crop_listing_id: body.crop_listing_id,
      quantity: body.quantity,
      total_price: totalPrice,
      status: 'pending'
    };
    
    // Begin a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }
    
    // Update the listing quantity and availability
    const remainingQuantity = listing.quantity - body.quantity;
    const updateData = {
      quantity: remainingQuantity,
      available: remainingQuantity > 0
    };
    
    const { error: updateError } = await supabase
      .from('crop_listings')
      .update(updateData)
      .eq('id', body.crop_listing_id);
    
    if (updateError) {
      console.error('Error updating listing quantity:', updateError);
      // We've already created the order, so we'll still return success
      // but log the error for investigation
    }
    
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Unexpected error in create order API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/marketplace/orders/:id - Update order status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const { status } = await request.json();
    
    // Create supabase client and get auth user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        crop_listing:crop_listings(farmer_id)
      `)
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Verify the user is the farmer who owns the listing
    if (order.crop_listing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Only the farmer can update order status' }, { status: 403 });
    }
    
    // Update the order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    
    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Unexpected error in update order API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 