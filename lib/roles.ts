import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'staff';

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return (userData?.role as UserRole) ?? null;
}

export function canAccessAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}