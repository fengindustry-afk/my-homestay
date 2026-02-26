import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Verifies if the current requester is an authenticated admin.
 */
export async function verifyAdmin() {
    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // sessions.
                }
            },
        },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('[verifyAdmin] User result:', { hasUser: !!user, error: userError });

    if (userError || !user) {
        console.log('[verifyAdmin] No user or error');
        return { authenticated: false, role: null, isAdmin: false };
    }

    // Use admin client with service_role to check user role directly from a protected table
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: userData, error: roleError } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
    
    console.log('[verifyAdmin] User data check:', { userData, roleError });

    if (roleError || !userData || userData.role !== 'admin') {
        console.log('[verifyAdmin] Not an admin or error:', { role: userData?.role, roleError });
        return { authenticated: true, role: userData?.role || null, isAdmin: false };
    }

    return { authenticated: true, role: 'admin', isAdmin: true, user: user };
}

/**
 * Verifies if the current requester is an authenticated staff or admin.
 */
export async function verifyStaff() {
    const verification = await verifyAdmin();
    if (verification.isAdmin) return { ...verification, isStaff: true };

    if (verification.authenticated && (verification.role === 'staff' || verification.role === 'admin')) {
        return { ...verification, isStaff: true };
    }

    return { ...verification, isStaff: false };
}

