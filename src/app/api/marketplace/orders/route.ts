import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { 
  createOrder,
  getUserOrders,
  getFarmerOrders,
  updateOrderStatus
} from '@/lib/marketplace-api';

// GET /api/marketplace/orders - Get orders for the current user
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Extract query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'buyer'; // 'buyer' or 'farmer'
    const orderId = url.searchParams.get('id') || undefined;
    
    // Get user profile to determine user_type
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    // If requesting farmer orders but user is not a farmer
    if (type === 'farmer' && (!profile || profile.user_type !== 'farmer')) {
      return NextResponse.json({ error: 'Only farmers can access farmer orders' }, { status: 403 });
    }

    if (orderId) {
      // Get a specific order by ID
      const { data, error } = type === 'farmer' 
        ? await getFarmerOrders(userId)
        : await getUserOrders(userId);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      // Find the specific order requested
      const order = data?.find(order => order.id === orderId);
      
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      return NextResponse.json(order);
    } else {
      // Get all orders for the user based on type
      const { data, error } = type === 'farmer' 
        ? await getFarmerOrders(userId)
        : await getUserOrders(userId);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      return NextResponse.json(data || []);
    }
  } catch (error: any) {
    console.error('Error in marketplace orders GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/marketplace/orders - Create a new order
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Add user ID to the order
    const orderData = {
      ...body,
      userId,
      status: 'pending' // Default status for new orders
    };

    const { data, error } = await createOrder(orderData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in marketplace orders POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/marketplace/orders - Update an order status
export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Get user profile to determine user_type
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    // Get the order to check permissions
    const { data: userOrders } = await getUserOrders(userId);
    const { data: farmerOrders } = profile?.user_type === 'farmer' ? await getFarmerOrders(userId) : { data: null };
    
    // Find the order in either buyer or farmer orders
    const order = (userOrders || []).find(o => o.id === id) || 
                  (farmerOrders || []).find(o => o.id === id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
    }
    
    // Check permissions for updating status
    const validFarmerStatusChanges = ['processing', 'shipped', 'cancelled'];
    const validBuyerStatusChanges = ['cancelled'];
    
    // If user is a farmer
    if (profile?.user_type === 'farmer') {
      // Verify this is the farmer's order
      if (order.farmer_id !== userId) {
        return NextResponse.json({ error: 'You can only update your own orders' }, { status: 403 });
      }
      
      // Check if the new status is allowed for farmers
      if (!validFarmerStatusChanges.includes(status)) {
        return NextResponse.json({ error: `Farmers can only change status to: ${validFarmerStatusChanges.join(', ')}` }, { status: 403 });
      }
    } else {
      // User is a buyer
      if (order.user_id !== userId) {
        return NextResponse.json({ error: 'You can only update your own orders' }, { status: 403 });
      }
      
      // Check if the new status is allowed for buyers
      if (!validBuyerStatusChanges.includes(status)) {
        return NextResponse.json({ error: `Buyers can only change status to: ${validBuyerStatusChanges.join(', ')}` }, { status: 403 });
      }
      
      // Additional check: buyers can only cancel pending orders
      if (status === 'cancelled' && order.status !== 'pending') {
        return NextResponse.json({ error: 'You can only cancel orders that are still pending' }, { status: 403 });
      }
    }

    // Update the order status
    const { success, error } = await updateOrderStatus(id, status);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error in marketplace orders PATCH:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}