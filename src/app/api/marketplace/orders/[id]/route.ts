import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/marketplace/orders/[id] - Get a specific order
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
    
    // Get user profile to determine user type
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        crop_listing:crop_listings(
          *,
          farmer:profiles!crop_listings_farmer_id_fkey(full_name)
        ),
        buyer:profiles!orders_buyer_id_fkey(full_name)
      `)
      .eq('id', id)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check if user has permission to view this order
    if (profile.user_type === 'buyer' && order.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }
    
    if (profile.user_type === 'farmer' && order.crop_listing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }
    
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Unexpected error in get order API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/marketplace/orders/[id] - Update an order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { status } = await request.json();
    
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
    
    // Check if the user is a farmer
    if (profile.user_type !== 'farmer') {
      return NextResponse.json({ error: 'Only farmers can update order status' }, { status: 403 });
    }
    
    // Get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        crop_listing:crop_listings(farmer_id)
      `)
      .eq('id', id)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Verify the user is the farmer who owns the listing
    if (order.crop_listing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Only the farmer who created the listing can update order status' }, { status: 403 });
    }
    
    // Verify the status is valid
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    // Update the order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in update order API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 