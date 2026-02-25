import { createServerClient } from '@supabase/auth-helpers-nextjs';
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
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
                cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
                cookieStore.set({ name, value: '', ...options });
            },
        },
    });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        return { authenticated: false, role: null, isAdmin: false };
    }

    // Use admin client to check role in the users table to avoid RLS limitations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: userData, error: roleError } = await adminClient
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (roleError || !userData || userData.role !== 'admin') {
        return { authenticated: true, role: userData?.role || null, isAdmin: false };
    }

    return { authenticated: true, role: 'admin', isAdmin: true, user: session.user };
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
