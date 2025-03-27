import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-helpers';

// GET /api/marketplace/listings/my-listings - Get the current farmer's listings
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    console.log('GET my-listings API: Authenticated user ID:', user.id);
    
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

    // Verify user is a farmer
    if (profile.user_type !== 'farmer') {
      return NextResponse.json(
        { error: 'Only farmers can access their listings' },
        { status: 403 }
      );
    }

    console.log('Fetching listings for farmer:', user.id);
    
    // Fetch all listings created by this farmer
    const { data, error } = await supabase
      .from('crop_listings')
      .select('*')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    console.log(`Found ${data.length} listings for farmer:`, user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/marketplace/listings/my-listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 