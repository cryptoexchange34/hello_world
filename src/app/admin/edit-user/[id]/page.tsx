'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { getAllUsers, updateUser } from '@/utils/adminUtils';
import Link from 'next/link';

interface UserEditParams {
  params: {
    id: string;
  };
}

export default function EditUser({ params }: UserEditParams) {
  const { id } = params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const router = useRouter();

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const users = getAllUsers();
        const user = users.find(user => user.id === id);
        
        if (!user) {
          setUserNotFound(true);
          setIsLoading(false);
          return;
        }
        
        setName(user.name || '');
        setEmail(user.email);
        setIsAdmin(user.isAdmin || false);
        setWalletBalance(user.walletBalance?.toString() || '0');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Simple validation
      if (!name || !email) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Update user
      const updatedUser = updateUser(id, {
        name,
        email,
        ...(password ? { password } : {}), // Only update password if provided
        isAdmin,
        walletBalance: parseFloat(walletBalance) || 0,
      });

      if (!updatedUser) {
        setError('User not found');
        setIsLoading(false);
        return;
      }

      setSuccess('User updated successfully');
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Edit User</h1>
            <Link 
              href="/admin" 
              className="text-gray-300 hover:text-white"
            >
              &larr; Back to Dashboard
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading user data...</p>
            </div>
          ) : userNotFound ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="text-red-500 mb-4 text-xl">User Not Found</div>
              <p className="text-gray-400 mb-4">The user you're trying to edit doesn't exist.</p>
              <Link 
                href="/admin" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              {error && (
                <div className="mb-6 bg-red-500 text-white p-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-500 text-white p-3 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password (leave blank to keep current)
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-300 mb-1">
                    Wallet Balance ($)
                  </label>
                  <input
                    id="walletBalance"
                    type="number"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="isAdmin"
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-300">
                    Admin privileges
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Updating User...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 