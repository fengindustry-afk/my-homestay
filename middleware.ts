import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Request for: ${request.nextUrl.pathname}`);
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          console.log(`[Middleware] Setting ${cookiesToSet.length} cookies`);
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  console.log(`[Middleware] Cookies present:`, request.cookies.getAll().map(c => c.name));

  console.log(`[Middleware] Getting session...`);
  const { data: { session } } = await supabase.auth.getSession();
  console.log(`[Middleware] Session: ${session ? 'exists' : 'null'}`);

  // Protect /finest-touch routes
  if (request.nextUrl.pathname.startsWith('/finest-touch')) {
    const isAuthPage =
      request.nextUrl.pathname === '/finest-touch/login' ||
      request.nextUrl.pathname.startsWith('/finest-touch/forgot') ||
      request.nextUrl.pathname.startsWith('/finest-touch/reset');

    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, isAuthPage: ${isAuthPage}`);

    if (!session && !isAuthPage) {
      console.log(`[Middleware] No session and not auth page, redirecting to login`);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/finest-touch/login';
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (session && !isAuthPage) {
      console.log(`[Middleware] Session exists, checking role for user ${session.user.id}`);
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      console.log(`[Middleware] User record:`, userData, roleError ? roleError.message : 'ok');

      if (!userData || (userData.role !== 'admin' && userData.role !== 'staff')) {
        console.log(`[Middleware] Unauthorized role or no user record, signing out and redirecting`);
        await supabase.auth.signOut();
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/finest-touch/login';
        redirectUrl.searchParams.set('error', 'unauthorized_role');
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  console.log(`[Middleware] Proceeding to ${request.nextUrl.pathname}`);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
