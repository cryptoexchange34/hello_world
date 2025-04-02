'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useTokens } from '@/context/TokenContext';

type SystemSettings = {
  maintenanceMode: boolean;
  tradingEnabled: boolean;
  withdrawalsEnabled: boolean;
  depositEnabled: boolean;
  defaultFeePercentage: number;
  defaultLeverageLimit: number;
  dailyWithdrawalLimit: number;
  theme: 'light' | 'dark';
  defaultTokens: string[];
  announcementBanner: string;
};

export default function AdminSystemSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { tokens, updateToken } = useTokens();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    tradingEnabled: true,
    withdrawalsEnabled: true,
    depositEnabled: true,
    defaultFeePercentage: 0.5,
    defaultLeverageLimit: 10,
    dailyWithdrawalLimit: 10000,
    theme: 'dark',
    defaultTokens: ['BTC', 'ETH', 'SOL'],
    announcementBanner: ''
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load settings
  useEffect(() => {
    if (!isMounted) return;

    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('systemSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error loading system settings:', error);
        setErrorMessage('Failed to load system settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: isChecked
      }));
    } else if (type === 'number') {
      setSettings(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save to localStorage
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      // Set cookies for middleware
      document.cookie = `maintenanceMode=${settings.maintenanceMode}; path=/; max-age=2592000`;
      
      // Apply maintenance mode to all tokens if enabled
      if (settings.maintenanceMode) {
        tokens.forEach(token => {
          if (token.active) {
            updateToken(token.id, { ...token, active: false });
          }
        });
      }
      
      setSuccessMessage('System settings updated successfully');
      setErrorMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving system settings:', error);
      setErrorMessage('Failed to save system settings');
      setSuccessMessage('');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings: SystemSettings = {
        maintenanceMode: false,
        tradingEnabled: true,
        withdrawalsEnabled: true,
        depositEnabled: true,
        defaultFeePercentage: 0.5,
        defaultLeverageLimit: 10,
        dailyWithdrawalLimit: 10000,
        theme: 'dark',
        defaultTokens: ['BTC', 'ETH', 'SOL'],
        announcementBanner: ''
      };
      
      setSettings(defaultSettings);
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
      setSuccessMessage('Settings reset to default values');
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
          
          {successMessage && (
            <div className="bg-green-500 text-white p-4 rounded mb-6">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-500 text-white p-4 rounded mb-6">
              {errorMessage}
            </div>
          )}
          
          {isLoading ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Loading system settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings}>
              {/* System Status */}
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-2">System Status</h2>
                  <p className="text-gray-400">Control the operational status of the platform</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 text-white">
                      Maintenance Mode
                      <span className="ml-2 text-sm text-red-400">(Will disable all tokens and trading)</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tradingEnabled"
                      name="tradingEnabled"
                      checked={settings.tradingEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <label htmlFor="tradingEnabled" className="ml-2 text-white">
                      Enable Trading
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="withdrawalsEnabled"
                      name="withdrawalsEnabled"
                      checked={settings.withdrawalsEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <label htmlFor="withdrawalsEnabled" className="ml-2 text-white">
                      Enable Withdrawals
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="depositEnabled"
                      name="depositEnabled"
                      checked={settings.depositEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <label htmlFor="depositEnabled" className="ml-2 text-white">
                      Enable Deposits
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Trading Settings */}
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-2">Trading Settings</h2>
                  <p className="text-gray-400">Configure trading parameters</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="defaultFeePercentage" className="block text-sm font-medium text-gray-300 mb-1">
                      Default Fee Percentage (%)
                    </label>
                    <input
                      type="number"
                      id="defaultFeePercentage"
                      name="defaultFeePercentage"
                      value={settings.defaultFeePercentage}
                      onChange={handleChange}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="defaultLeverageLimit" className="block text-sm font-medium text-gray-300 mb-1">
                      Default Leverage Limit
                    </label>
                    <input
                      type="number"
                      id="defaultLeverageLimit"
                      name="defaultLeverageLimit"
                      value={settings.defaultLeverageLimit}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dailyWithdrawalLimit" className="block text-sm font-medium text-gray-300 mb-1">
                      Daily Withdrawal Limit ($)
                    </label>
                    <input
                      type="number"
                      id="dailyWithdrawalLimit"
                      name="dailyWithdrawalLimit"
                      value={settings.dailyWithdrawalLimit}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* UI Settings */}
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-2">Interface Settings</h2>
                  <p className="text-gray-400">Configure UI appearance and behavior</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-1">
                      Default Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      value={settings.theme}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="announcementBanner" className="block text-sm font-medium text-gray-300 mb-1">
                      Announcement Banner
                    </label>
                    <textarea
                      id="announcementBanner"
                      name="announcementBanner"
                      value={settings.announcementBanner}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter announcement text that will appear at the top of every page..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reset to Defaults
                </button>
                
                <div className="space-x-4">
                  <Link 
                    href="/admin" 
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 