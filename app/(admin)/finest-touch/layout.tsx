'use client';

import { signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function FinestTouchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if we are currently on the login page
  const isLoginPage = pathname === '/finest-touch/login';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth session...');
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        console.log('User result:', { hasUser: !!user, error: userErr });

        if (!user) {
          console.log('No user found');
          if (!isLoginPage) {
            console.log('Redirecting to login');
            router.replace('/finest-touch/login');
          } else {
            setLoading(false);
          }
          return;
        }

        // Check user role from public.users table
        const { data: userData, error: roleErr } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('Role check result:', { userData, roleErr });

        if (roleErr || !userData || (userData.role !== 'admin' && userData.role !== 'staff')) {
          console.error('Unauthorized role or error:', roleErr);
          if (!isLoginPage) {
            router.replace('/finest-touch/login?error=unauthorized');
          } else {
            setLoading(false);
          }
          return;
        }

        // IMPORTANT: If we are on login page, redirect to dashboard
        if (isLoginPage) {
          console.log('On login page with valid session/role, redirecting to dashboard');
          router.replace('/finest-touch');
          return;
        }

        console.log('Auth and Role check successful, setting user and stopping loading');
        setUser(user);
        setLoading(false);
        console.log('setLoading(false) called');
      } catch (error) {
        console.error('Error checking auth:', error);
        if (!isLoginPage) {
          router.replace('/finest-touch/login');
        } else {
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed event:', event, { hasSession: !!session });
        
        if (!session) {
          console.log('onAuthStateChange: No session');
          if (!isLoginPage) {
            router.replace('/finest-touch/login');
          } else {
            setLoading(false);
          }
        } else {
          // If session exists, let checkAuth handle the logic or handle it here if it's a login event
          if (event === 'SIGNED_IN') {
            checkAuth();
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname, isLoginPage]);

  if (loading) {
    console.log('Rendering Loading state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-dark)]">
        <div className="text-center">
          <div className="text-lg text-[var(--text-strong)] font-medium italic">Loading...</div>
          <div className="text-sm text-[var(--text-muted)] mt-2">
            Verifying your security credentials...
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering Layout content. User:', !!user, 'isLoginPage:', isLoginPage);
  
  // If we are on the login page, just render the login form without the protected layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If no user and not on login page, don't show anything (redirection is handled in useEffect)
  if (!user) {
    console.log('No user state yet, rendering null');
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-dark)] transition-colors duration-300">
      <header className="bg-[var(--surface)] shadow border-b border-[var(--border)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-[var(--primary)]">Command Center</h1>
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-dark)] underline transition-colors"
            >
              ← Back to Site
            </button>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <span className="text-sm text-[var(--text-muted)] font-medium">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] border border-[var(--border)] px-4 py-2 rounded-lg transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
