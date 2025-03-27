import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

// GET /api/marketplace/orders/[id] - Get a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Get the order with related data
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        crop_listing:crop_listings(
          id,
          crop_name,
          quantity,
          price_per_unit,
          unit,
          farmer_id,
          farmer:profiles(
            full_name
          )
        ),
        buyer:profiles(
          full_name
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this order
    const isBuyer = data.buyer_id === user.id;
    const isFarmer = data.crop_listing.farmer_id === user.id;

    if (!isBuyer && !isFarmer) {
      return NextResponse.json(
        { error: 'You are not authorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/marketplace/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/marketplace/orders/[id] - Update an order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Get the order to verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        crop_listing_id,
        crop_listing:crop_listings(
          farmer_id
        )
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify the user is the farmer who owns the listing
    if (order.crop_listing.farmer_id !== user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to update this order' },
        { status: 403 }
      );
    }

    // Update the order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.id)
      .select();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error in PUT /api/marketplace/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 