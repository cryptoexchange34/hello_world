'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, this would make an API call to update the user's profile
      // For this demo, we'll just show a success message
      
      // Update local storage user information
      if (user) {
        const updatedUser = {
          ...user,
          name,
          email
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile');
      setSuccessMessage('');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Profile Information</h2>
              <p className="text-gray-400">Update your account's profile information.</p>
            </div>
            
            {successMessage && (
              <div className="bg-green-500 text-white p-4">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-500 text-white p-4">
                {errorMessage}
              </div>
            )}
            
            <div className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Security</h2>
              <p className="text-gray-400">Manage your security settings.</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white">Change Password</h3>
                  <p className="text-gray-400 mb-4">Ensure your account is using a secure password.</p>
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    onClick={() => alert('This feature is not implemented in the demo')}
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                  <p className="text-gray-400 mb-4">Add additional security to your account using two-factor authentication.</p>
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    onClick={() => alert('This feature is not implemented in the demo')}
                  >
                    Enable 2FA
                  </button>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-red-400">Delete Account</h3>
                  <p className="text-gray-400 mb-4">Permanently delete your account and all of your data.</p>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        logout();
                      }
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 