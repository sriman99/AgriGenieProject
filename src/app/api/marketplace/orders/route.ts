import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

// GET /api/marketplace/orders - Get orders for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // Initialize Supabase client
    const supabase = createClient();

    // Get user profile to determine user type
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Create base query
    let query = supabase
      .from('orders')
      .select(`
        *,
        crop_listing:crop_listings(
          id,
          crop_name,
          price_per_unit,
          unit,
          quantity,
          available,
          farmer:profiles(
            id,
            full_name
          )
        ),
        buyer:profiles(
          id,
          full_name
        )
      `);

    // Apply filters based on user type
    if (profile.user_type === 'buyer') {
      // Buyers see their own orders
      query = query.eq('buyer_id', user.id);
    } else if (profile.user_type === 'farmer') {
      // Farmers see orders for their listings
      query = query.eq('crop_listing.farmer_id', user.id);
    } else {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Order by created_at, newest first
    query = query.order('created_at', { ascending: false });

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/marketplace/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/orders - Create a new order
export async function POST(request: NextRequest) {
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
    const { crop_listing_id, quantity } = await request.json();
    
    if (!crop_listing_id || !quantity) {
      return NextResponse.json(
        { error: 'crop_listing_id and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Check if the user is a buyer
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.user_type !== 'buyer') {
      return NextResponse.json(
        { error: 'Only buyers can create orders' },
        { status: 403 }
      );
    }

    // Get the listing to check availability and calculate price
    const { data: listing, error: listingError } = await supabase
      .from('crop_listings')
      .select('*')
      .eq('id', crop_listing_id)
      .eq('available', true)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found or not available' },
        { status: 404 }
      );
    }

    // Check if farmer is trying to buy their own listing
    if (listing.farmer_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot buy your own listing' },
        { status: 400 }
      );
    }

    // Check if quantity is available
    if (quantity > listing.quantity) {
      return NextResponse.json(
        { error: 'Requested quantity exceeds available quantity' },
        { status: 400 }
      );
    }

    // Calculate total price
    const total_price = quantity * listing.price_per_unit;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        crop_listing_id,
        quantity,
        total_price,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Update listing quantity
    const remaining_quantity = listing.quantity - quantity;
    const { error: updateError } = await supabase
      .from('crop_listings')
      .update({ 
        quantity: remaining_quantity,
        available: remaining_quantity > 0,
      })
      .eq('id', crop_listing_id);

    if (updateError) {
      console.error('Error updating listing quantity:', updateError);
      // We could roll back the order here, but for simplicity, we'll just log the error
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error in POST /api/marketplace/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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