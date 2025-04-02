'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState('0');
  const [joinDate, setJoinDate] = useState<string | null>(null);

  // Load wallet balance from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBalance = localStorage.getItem('walletBalance');
      if (storedBalance) {
        setWalletBalance(storedBalance);
      }

      // Format join date
      if (user?.signupDate) {
        const date = new Date(user.signupDate);
        setJoinDate(date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }));
      }
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <Link
              href="/settings"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Edit Profile
            </Link>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-700">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 md:mb-0 md:mr-6">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.name || 'User'}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                  {joinDate && (
                    <p className="text-gray-500 mt-1">Joined on {joinDate}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Wallet Balance</h3>
                  <p className="text-2xl font-bold text-white">${parseFloat(walletBalance).toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Account Type</h3>
                  <p className="text-2xl font-bold text-white">{user?.isAdmin ? 'Administrator' : 'Regular User'}</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Account Status</h3>
                  <p className="text-2xl font-bold text-green-500">Active</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Last Login</h3>
                  <p className="text-2xl font-bold text-white">Today</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                  <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">Account Login</div>
                    <div className="text-sm text-gray-400">Today at {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                  <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">Deposit Received</div>
                    <div className="text-sm text-gray-400">Initial deposit of $10,000</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-750 rounded-lg">
                  <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">Account Created</div>
                    <div className="text-sm text-gray-400">{joinDate || 'Recently'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 