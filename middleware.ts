import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, sweepExpired } from '@/lib/rateLimit';

// Best-effort edge rate limit on the server API surface (mirrors the rawsec
// Nginx `limit_req` zones). 60 requests / minute per IP across /api/*.
const API_LIMIT = 60;
const API_WINDOW_MS = 60_000;

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate limit the API surface ---
  if (pathname.startsWith('/api/')) {
    sweepExpired();
    const result = rateLimit(`${clientIp(request)}:api`, API_LIMIT, API_WINDOW_MS);
    if (!result.ok) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      });
    }
  }

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  const { data: { session } } = await supabase.auth.getSession();

  // Protect /finest-touch routes
  if (pathname.startsWith('/finest-touch')) {
    const isAuthPage =
      pathname === '/finest-touch/login' ||
      pathname.startsWith('/finest-touch/forgot') ||
      pathname.startsWith('/finest-touch/reset');

    if (!session && !isAuthPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/finest-touch/login';
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (session && !isAuthPage) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!userData || (userData.role !== 'admin' && userData.role !== 'staff')) {
        await supabase.auth.signOut();
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/finest-touch/login';
        redirectUrl.searchParams.set('error', 'unauthorized_role');
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
