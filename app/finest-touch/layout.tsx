'use client';

import { signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (!isLoginPage) {
            router.push('/finest-touch/login');
          } else {
            // Already on login page and no session, stop loading
            setLoading(false);
          }
          return;
        }

        // If we have a session but are on login page, redirect to dashboard
        if (isLoginPage) {
          router.push('/finest-touch');
          return;
        }

        setUser(session.user);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        if (!isLoginPage) {
          router.push('/finest-touch/login');
        } else {
          setLoading(false);
        }
      }
    };

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out, redirecting to login');
        if (!isLoginPage) {
          router.push('/finest-touch/login');
        } else {
          setLoading(false);
        }
      }
    }, 5000);

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        clearTimeout(timeout);
        if (!session) {
          if (!isLoginPage) {
            router.push('/finest-touch/login');
          } else {
            setLoading(false);
          }
        } else {
          if (isLoginPage) {
            router.push('/finest-touch');
          } else {
            setUser(session.user);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router, pathname, isLoginPage, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
          <div className="text-sm text-gray-500 mt-2">
            If this takes too long, you will be redirected to login.
          </div>
        </div>
      </div>
    );
  }

  // If we are on the login page, just render the login form without the protected layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If no user and not on login page, don't show anything (redirection is handled in useEffect)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to Site
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
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
