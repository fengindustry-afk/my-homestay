import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  // Invalidate Supabase session on the auth backend
  await supabase.auth.signOut({ scope: 'global' });

  // Redirect response
  const response = NextResponse.redirect(
    new URL(
      '/finest-touch/login',
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    )
  );

  // Explicitly clear Supabase auth cookies in the browser
  response.cookies.set('sb-access-token', '', {
    maxAge: 0,
    path: '/',
  });
  response.cookies.set('sb-refresh-token', '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}