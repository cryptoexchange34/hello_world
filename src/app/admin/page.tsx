'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { getAllUsers, removeUser } from '@/utils/adminUtils';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: string;
  name?: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  walletBalance?: number;
  signupDate?: string;
}

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  active: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTokens: 0,
    activeTokens: 0,
    totalTrades: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load users
  useEffect(() => {
    if (!isMounted) return;

    const loadUsers = () => {
      try {
        console.log('Loading users from adminUtils...');
        const allUsers = getAllUsers();
        console.log('Admin page: Loaded users:', allUsers.length);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isMounted]);

  // Load tokens
  useEffect(() => {
    if (isMounted) {
      // Load tokens from localStorage or create mock data
      const storedTokens = localStorage.getItem('customTokens');
      let tokensList = [];
      
      if (storedTokens) {
        tokensList = JSON.parse(storedTokens);
      } else {
        // Mock tokens if none exist
        tokensList = [
          {
            id: '1',
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 40293.25,
            change24h: 2.41,
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            symbol: 'ETH',
            name: 'Ethereum',
            price: 2475.18,
            change24h: -0.82,
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            symbol: 'SOL',
            name: 'Solana',
            price: 113.82,
            change24h: 5.67,
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            symbol: 'BNB',
            name: 'Binance Coin',
            price: 437.65,
            change24h: 1.23,
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            symbol: 'XRP',
            name: 'Ripple',
            price: 0.54,
            change24h: -1.47,
            active: true,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('customTokens', JSON.stringify(tokensList));
      }
      
      setTokens(tokensList);
      
      // Update stats with token data
      setStats(prev => ({
        ...prev,
        totalTokens: tokensList.length,
        activeTokens: tokensList.filter((t: Token) => t.active).length
      }));
    }
  }, [isMounted]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const success = removeUser(userId);
        if (success) {
          setUsers(users.filter(user => user.id !== userId));
          alert('User deleted successfully');
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user');
      }
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded p-4">
            <h2 className="text-sm text-gray-400">Total Users</h2>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
          
          <div className="bg-gray-800 rounded p-4">
            <h2 className="text-sm text-gray-400">Active Users</h2>
            <p className="text-2xl font-bold text-white">{users.filter(user => user.isLoggedIn).length}</p>
          </div>
          
          <div className="bg-gray-800 rounded p-4">
            <h2 className="text-sm text-gray-400">Total Tokens</h2>
            <p className="text-2xl font-bold text-white">{stats.totalTokens}</p>
          </div>
          
          <div className="bg-gray-800 rounded p-4">
            <h2 className="text-sm text-gray-400">Active Tokens</h2>
            <p className="text-2xl font-bold text-white">{stats.activeTokens}</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/add-user" className="block bg-gray-800 hover:bg-gray-700 p-4 rounded transition duration-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Add New User</h3>
                  <p className="text-sm text-gray-400">Create a new user account</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/tokens" className="block bg-gray-800 hover:bg-gray-700 p-4 rounded transition duration-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Manage Tokens</h3>
                  <p className="text-sm text-gray-400">Add or edit cryptocurrency tokens</p>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/settings" className="block bg-gray-800 hover:bg-gray-700 p-4 rounded transition duration-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">System Settings</h3>
                  <p className="text-sm text-gray-400">Configure platform settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading users...</p>
              </div>
            ) : !isMounted ? (
              <div className="p-6 text-center text-gray-400">
                <p>Initializing admin panel...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p>No users found. This could be due to a browser storage issue.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reload Page
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p>No users found matching your search.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{user.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isLoggedIn ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.isAdmin ? 'Admin' : 'User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${user.walletBalance?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(user.signupDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/edit-user/${user.id}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={user.isAdmin}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 