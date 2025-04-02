'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import Link from 'next/link';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  active: boolean;
  createdAt: string;
}

export default function AdminTokensPage() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    price: '',
    change24h: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Load tokens from localStorage or create mock data
    const storedTokens = localStorage.getItem('customTokens');
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
    } else {
      // Mock tokens if none exist
      const defaultTokens: Token[] = [
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
      setTokens(defaultTokens);
      localStorage.setItem('customTokens', JSON.stringify(defaultTokens));
    }
    setIsLoading(false);
  }, []);

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      price: '',
      change24h: ''
    });
    setEditingToken(null);
    setShowAddForm(false);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToken = () => {
    setShowAddForm(true);
    resetForm();
  };

  const handleEditToken = (token: Token) => {
    setEditingToken(token);
    setFormData({
      symbol: token.symbol,
      name: token.name,
      price: token.price.toString(),
      change24h: token.change24h.toString()
    });
    setShowAddForm(true);
  };

  const validateForm = (): boolean => {
    if (!formData.symbol || !formData.name || !formData.price) {
      setError('Symbol, name, and price are required fields');
      return false;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      return false;
    }

    const change = parseFloat(formData.change24h || '0');
    if (isNaN(change)) {
      setError('Change percentage must be a number');
      return false;
    }

    // Check for duplicate symbol for new tokens
    if (!editingToken && tokens.some(t => t.symbol === formData.symbol.toUpperCase())) {
      setError(`Token with symbol ${formData.symbol.toUpperCase()} already exists`);
      return false;
    }

    return true;
  };

  const handleSubmitToken = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (editingToken) {
      // Update existing token
      const updatedTokens = tokens.map(token => 
        token.id === editingToken.id 
          ? {
              ...token,
              symbol: formData.symbol.toUpperCase(),
              name: formData.name,
              price: parseFloat(formData.price),
              change24h: parseFloat(formData.change24h || '0')
            }
          : token
      );
      setTokens(updatedTokens);
      localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
      setSuccessMessage(`Token ${formData.symbol.toUpperCase()} updated successfully`);
    } else {
      // Add new token
      const newToken: Token = {
        id: Date.now().toString(),
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        price: parseFloat(formData.price),
        change24h: parseFloat(formData.change24h || '0'),
        active: true,
        createdAt: new Date().toISOString()
      };
      
      const updatedTokens = [...tokens, newToken];
      setTokens(updatedTokens);
      localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
      setSuccessMessage(`Token ${newToken.symbol} added successfully`);
    }

    resetForm();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleToggleActive = (tokenId: string) => {
    const updatedTokens = tokens.map(token => 
      token.id === tokenId 
        ? { ...token, active: !token.active }
        : token
    );
    setTokens(updatedTokens);
    localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
  };

  const handleDeleteToken = (tokenId: string) => {
    if (window.confirm('Are you sure you want to delete this token?')) {
      const updatedTokens = tokens.filter(token => token.id !== tokenId);
      setTokens(updatedTokens);
      localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
      setSuccessMessage('Token deleted successfully');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Token Management</h1>
              <p className="mt-2 text-gray-400">Add and manage tokens available on the platform</p>
            </div>
            <button
              onClick={handleAddToken}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add New Token
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-800 text-green-200 rounded">
              {successMessage}
            </div>
          )}

          {showAddForm && (
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingToken ? 'Edit Token' : 'Add New Token'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmitToken} className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-red-200 rounded">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Symbol (e.g. BTC)
                    </label>
                    <input
                      type="text"
                      name="symbol"
                      maxLength={10}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.symbol}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Name (e.g. Bitcoin)
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Current Price (USD)
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.00000001"
                      min="0"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      24h Change (%)
                    </label>
                    <input
                      type="number"
                      name="change24h"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.change24h}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingToken ? 'Update Token' : 'Add Token'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Available Tokens</h2>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-400">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading tokens...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p>No tokens added yet.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Token
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Price (USD)
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        24h Change
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {tokens.map((token) => (
                      <tr key={token.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {token.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{token.name}</div>
                              <div className="text-sm text-gray-400">{token.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white font-medium">
                          ${token.price < 1 
                            ? token.price.toFixed(4) 
                            : token.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            token.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={token.active} 
                              onChange={() => handleToggleActive(token.id)}
                              className="sr-only peer" 
                            />
                            <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300">
                              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 transform peer-checked:translate-x-5"></div>
                            </div>
                            <span className="ml-3 text-sm text-gray-300">{token.active ? 'Active' : 'Inactive'}</span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(token.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                          <button
                            onClick={() => handleEditToken(token)}
                            className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteToken(token.id)}
                            className="px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 