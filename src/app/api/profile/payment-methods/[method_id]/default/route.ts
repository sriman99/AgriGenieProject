import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: Request,
  { params }: { params: { method_id: string } }
) {
  try {
    const methodId = params.method_id;
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // First verify that this payment method belongs to the user
    const { data: methodData, error: fetchError } = await supabase
      .from('payment_methods')
      .select('user_id')
      .eq('id', methodId)
      .single();
    
    if (fetchError) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }
    
    if (methodData.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Start a transaction to update payment methods
    // 1. Set all payment methods for this user to is_default=false
    const { error: updateAllError } = await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', session.user.id);
    
    if (updateAllError) {
      return NextResponse.json({ error: updateAllError.message }, { status: 500 });
    }
    
    // 2. Set the selected payment method to is_default=true
    const { error: updateOneError } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', methodId);
    
    if (updateOneError) {
      return NextResponse.json({ error: updateOneError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}