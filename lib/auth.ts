'use client';

import { supabase } from './supabaseClient';

export async function signOut() {
  try {
    // Clear Supabase session on client
    await supabase.auth.signOut({ scope: 'global' });

    // Extra safety: clear any local/session storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore storage errors
      }
    }

    // Hard redirect to login to avoid any cached state
    window.location.href = '/finest-touch/login';
  } catch (e) {
    console.error('Error during sign out', e);
    window.location.href = '/finest-touch/login';
  }
}