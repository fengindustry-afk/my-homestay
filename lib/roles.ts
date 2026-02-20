import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'staff';

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  return (user?.role as UserRole) ?? null;
}

export function canAccessAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}