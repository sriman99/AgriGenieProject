import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  // Skip middleware for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/marketplace')) {
    return NextResponse.next();
  }
  
  // Skip middleware for GET requests to public listings endpoint
  if (request.method === 'GET' && request.nextUrl.pathname === '/api/marketplace/listings') {
    console.log('Middleware: Skipping auth check for public listings endpoint');
    return NextResponse.next();
  }

  // Log the current path to help with debugging
  console.log('Middleware: Processing request for:', request.nextUrl.pathname, 'Method:', request.method);
  
  try {
    console.log('Middleware: Starting authentication check for:', request.nextUrl.pathname);
    
    // Create a response object that we can use for passing through cookies
    const response = NextResponse.next();
    
    // Get cookies from the request
    const supabaseAuthCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb-refresh-token');
    console.log('Middleware: Supabase auth cookie present:', !!supabaseAuthCookie);
    
    // Create a Supabase client
    const supabase = createClient();
    
    // Get current session - this will automatically use cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Middleware: Session error:', sessionError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }
    
    console.log('Middleware: Session exists:', !!session, session?.user?.id);
    
    // If there's a session, get the user
    if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Middleware: User error:', userError);
        return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
      }
      
      // If user is authenticated, continue
      if (user) {
        console.log('Middleware: Authenticated user found:', user.id);
        // Add user ID to request headers for downstream handlers
        response.headers.set('x-user-id', user.id);
        return response;
      }
    }
    
    // If there's no session or user, return 401
    console.log('Middleware: No authenticated user found for API route');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Apply middleware to API routes that require authentication
export const config = {
  matcher: ['/api/marketplace/:path*'],
}; 