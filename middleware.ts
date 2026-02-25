import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    req.cookies.set({ name, value, ...options });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: any) {
                    req.cookies.set({ name, value: '', ...options });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();

    // Protect /finest-touch routes
    if (req.nextUrl.pathname.startsWith('/finest-touch')) {
        // Exclude login, forgot, and reset pages from redirect
        const isAuthPage =
            req.nextUrl.pathname === '/finest-touch/login' ||
            req.nextUrl.pathname.startsWith('/finest-touch/forgot') ||
            req.nextUrl.pathname.startsWith('/finest-touch/reset');

        if (!session && !isAuthPage) {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = '/finest-touch/login';
            redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }

        if (session && !isAuthPage) {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (!userData || (userData.role !== 'admin' && userData.role !== 'staff')) {
                // Logged in but no role? Sign out and redirect to login
                await supabase.auth.signOut();
                const redirectUrl = req.nextUrl.clone();
                redirectUrl.pathname = '/finest-touch/login';
                redirectUrl.searchParams.set('error', 'unauthorized_role');
                return NextResponse.redirect(redirectUrl);
            }
        }
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
