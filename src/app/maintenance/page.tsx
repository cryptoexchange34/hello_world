'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isMaintenanceMode } from '@/utils/systemUtils';
import { useAuth } from '@/context/AuthContext';

export default function MaintenancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Check if maintenance mode is active
    if (isMounted && !isMaintenanceMode() && !user?.isAdmin) {
      // Redirect to home if maintenance mode is not active
      router.push('/');
    }
  }, [router, isMounted, user]);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">System Maintenance</h1>
        
        <p className="text-gray-300 mb-6">
          Our platform is currently undergoing scheduled maintenance. We apologize for any inconvenience this may cause.
        </p>
        
        <p className="text-gray-300 mb-6">
          Please check back later. We're working hard to improve your experience and will be back online shortly.
        </p>
        
        {user?.isAdmin && (
          <div className="mt-8 border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-4">
              You're seeing this page because the platform is in maintenance mode.
            </p>
            <Link href="/admin/settings" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to System Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 