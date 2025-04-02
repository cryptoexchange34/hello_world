'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { addUser } from '@/utils/adminUtils';
import Link from 'next/link';

export default function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simple validation
      if (!name || !email || !password) {
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

      // Create new user
      addUser({
        name,
        email,
        password, // In a real app, this would be hashed
        isLoggedIn: false,
        isAdmin,
        walletBalance: parseFloat(walletBalance) || 0,
        signupDate: new Date().toISOString()
      });

      // Redirect back to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Add New User</h1>
            <Link 
              href="/admin" 
              className="text-gray-300 hover:text-white"
            >
              &larr; Back to Dashboard
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {error && (
              <div className="mb-6 bg-red-500 text-white p-3 rounded">
                {error}
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
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-300 mb-1">
                  Initial Wallet Balance ($)
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
                  Grant admin privileges
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
                  {isLoading ? 'Adding User...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 