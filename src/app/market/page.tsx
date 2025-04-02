'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTokens } from '@/context/TokenContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function MarketPage() {
  const { user } = useAuth();
  const { tokens, loading: tokensLoading } = useTokens();
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof (typeof tokens)[0];
    direction: 'ascending' | 'descending';
  }>({ key: 'marketCap', direction: 'descending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [marketData, setMarketData] = useState<any[]>([]);

  // Prepare market data from tokens
  useEffect(() => {
    if (!tokensLoading) {
      // Convert tokens to market data format
      const enrichedMarketData = tokens.map(token => ({
        ...token,
        volume24h: Math.random() * 1000000000 * (token.price || 1), // Random volume based on price
        marketCap: Math.random() * 10000000000 * (token.price || 1), // Random market cap based on price
      }));
      
      setMarketData(enrichedMarketData);
      setIsLoading(false);
    }
  }, [tokens, tokensLoading]);

  const requestSort = (key: keyof (typeof marketData)[0]) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    const sortableData = [...marketData];
    
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableData;
  };

  const getFilteredData = () => {
    if (!searchTerm) return getSortedData();
    
    return getSortedData().filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    }
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Cryptocurrency Market</h1>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Market Overview */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Market Overview</h2>
              <p className="text-gray-400">Live prices and market cap of top cryptocurrencies</p>
            </div>
            
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-400">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading market data...</p>
                </div>
              ) : getFilteredData().length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p>No cryptocurrencies found matching your search.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                        <div className="flex items-center">
                          Cryptocurrency
                          {sortConfig.key === 'name' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('price')}>
                        <div className="flex items-center justify-end">
                          Price
                          {sortConfig.key === 'price' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('change24h')}>
                        <div className="flex items-center justify-end">
                          24h Change
                          {sortConfig.key === 'change24h' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('volume24h')}>
                        <div className="flex items-center justify-end">
                          24h Volume
                          {sortConfig.key === 'volume24h' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('marketCap')}>
                        <div className="flex items-center justify-end">
                          Market Cap
                          {sortConfig.key === 'marketCap' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {getFilteredData().filter(crypto => crypto.active).map((crypto) => (
                      <tr key={crypto.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {crypto.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{crypto.name}</div>
                              <div className="text-sm text-gray-400">{crypto.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white font-medium">
                          ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            crypto.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                          {formatVolume(crypto.volume24h)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">
                          {formatMarketCap(crypto.marketCap)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Link href={`/trade?token=${crypto.symbol}`} className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Trade
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          {/* Market Trends - Could be expanded in a real app */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Market Trends</h2>
              <p className="text-gray-400">Latest cryptocurrency market trends and insights</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Top Gainer (24h)</h3>
                  {isLoading ? (
                    <div className="animate-pulse h-6 bg-gray-600 rounded w-1/2 mt-2"></div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2 text-xs">
                        {getSortedData().filter(t => t.active).sort((a, b) => b.change24h - a.change24h)[0]?.symbol.charAt(0)}
                      </div>
                      <p className="text-xl font-bold text-white">
                        {getSortedData().filter(t => t.active).sort((a, b) => b.change24h - a.change24h)[0]?.name}
                        <span className="ml-2 text-green-500">
                          +{getSortedData().filter(t => t.active).sort((a, b) => b.change24h - a.change24h)[0]?.change24h.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Top Loser (24h)</h3>
                  {isLoading ? (
                    <div className="animate-pulse h-6 bg-gray-600 rounded w-1/2 mt-2"></div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2 text-xs">
                        {getSortedData().filter(t => t.active).sort((a, b) => a.change24h - b.change24h)[0]?.symbol.charAt(0)}
                      </div>
                      <p className="text-xl font-bold text-white">
                        {getSortedData().filter(t => t.active).sort((a, b) => a.change24h - b.change24h)[0]?.name}
                        <span className="ml-2 text-red-500">
                          {getSortedData().filter(t => t.active).sort((a, b) => a.change24h - b.change24h)[0]?.change24h.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Total Market Cap</h3>
                  {isLoading ? (
                    <div className="animate-pulse h-6 bg-gray-600 rounded w-1/2 mt-2"></div>
                  ) : (
                    <p className="text-xl font-bold text-white">
                      {formatMarketCap(marketData.filter(t => t.active).reduce((sum, crypto) => sum + crypto.marketCap, 0))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Admin Action Button */}
          {user?.isAdmin && (
            <div className="mt-8 text-center">
              <Link href="/admin/tokens" className="inline-flex items-center px-4 py-2 border border-green-500 text-green-500 bg-gray-800 rounded-md hover:bg-green-500 hover:text-white transition-colors">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Manage Tokens
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 