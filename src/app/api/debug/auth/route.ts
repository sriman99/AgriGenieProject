import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to get session',
        error: sessionError.message
      }, { status: 500 });
    }
    
    // Check if session exists
    if (!sessionData.session) {
      return NextResponse.json({
        status: 'unauthenticated',
        message: 'No active session found',
        cookies: {
          hasSbAccessToken: !!request.cookies.get('sb-access-token'),
          hasSbRefreshToken: !!request.cookies.get('sb-refresh-token')
        }
      });
    }
    
    // Get user details
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to get user',
        session: {
          expires_at: sessionData.session.expires_at,
          expires_in: sessionData.session.expires_in
        },
        error: userError.message
      }, { status: 500 });
    }
    
    // Get user profile
    let profileData = null;
    let profileError = null;
    
    if (userData.user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      profileData = profile;
      profileError = error;
    }
    
    return NextResponse.json({
      status: 'authenticated',
      message: 'Authentication is working correctly',
      session: {
        expires_at: sessionData.session.expires_at,
        expires_in: sessionData.session.expires_in
      },
      user: {
        id: userData.user?.id,
        email: userData.user?.email,
        has_profile: !!profileData
      },
      profile: profileData ? {
        user_type: profileData.user_type,
        full_name: profileData.full_name
      } : null,
      cookies: {
        hasSbAccessToken: !!request.cookies.get('sb-access-token'),
        hasSbRefreshToken: !!request.cookies.get('sb-refresh-token')
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    }, { status: 500 });
  }
} 