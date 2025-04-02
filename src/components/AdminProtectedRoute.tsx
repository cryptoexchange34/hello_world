'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      if (isLoading) return;

      if (!user) {
        // Redirect to login if not logged in
        console.log('AdminProtectedRoute: User not logged in, redirecting to login');
        router.push('/login');
        return;
      }

      // Check if user is an admin using the context value
      if (!isAdmin) {
        // Redirect to dashboard if not an admin
        console.log('AdminProtectedRoute: User is not an admin, redirecting to dashboard');
        router.push('/');
        return;
      }
      
      // User is authorized
      console.log('AdminProtectedRoute: User is authorized as admin');
      setAuthorized(true);
    };

    checkAdminAccess();
  }, [user, isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Checking admin access...</p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
} 