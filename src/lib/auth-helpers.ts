import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Gets the currently authenticated user
 * @returns The user object or null if not authenticated
 */
export async function getAuthUser() {
  const supabase = createClient();
  
  // First get session to check authentication state
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log('getAuthUser: No valid session found');
    return null;
  }
  
  // Then get user details
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('getAuthUser: Error fetching user:', userError);
    return null;
  }
  
  console.log('getAuthUser: Authenticated user found:', user?.id);
  return user;
}

/**
 * Helper to create an authenticated API handler
 * @param handler The handler function to wrap with authentication
 * @returns A handler that checks for authentication before executing
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      console.log('withAuth: Checking authentication for route:', req.nextUrl.pathname);
      
      // Get authenticated user
      const user = await getAuthUser();
      
      // If no user, return unauthorized
      if (!user) {
        console.log('withAuth: No authenticated user found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      console.log('withAuth: User authenticated successfully:', user.id);
      
      // Call the handler with the authenticated user
      return handler(req, user);
    } catch (error) {
      console.error('API authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication error' }, 
        { status: 500 }
      );
    }
  };
}

/**
 * Refreshes the authentication token if needed
 * @returns True if refreshed successfully, false otherwise
 */
export async function refreshAuthToken() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('refreshAuthToken: No session to refresh');
      return false;
    }
    
    // Check if the token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt - now <= fiveMinutes) {
      console.log('refreshAuthToken: Token about to expire, refreshing...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('refreshAuthToken: Error refreshing token:', error);
        return false;
      }
      
      console.log('refreshAuthToken: Token refreshed successfully');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('refreshAuthToken: Unexpected error:', error);
    return false;
  }
} 