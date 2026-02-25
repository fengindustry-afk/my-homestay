import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

    const { data: { session } } = await supabase.auth.getSession();

    // Protect /finest-touch routes
    if (request.nextUrl.pathname.startsWith('/finest-touch')) {
        const isAuthPage =
            request.nextUrl.pathname === '/finest-touch/login' ||
            request.nextUrl.pathname.startsWith('/finest-touch/forgot') ||
            request.nextUrl.pathname.startsWith('/finest-touch/reset');

        if (!session && !isAuthPage) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/finest-touch/login';
            redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
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

