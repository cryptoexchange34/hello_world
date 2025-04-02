'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTokens } from '@/context/TokenContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import TradingChart from '@/components/TradingChart';
import TokenList from '@/components/TokenList';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const { user } = useAuth();
  const { tokens, loading: tokensLoading } = useTokens();
  const [walletBalance, setWalletBalance] = useState<number>(10000);
  const [cryptoBalance, setCryptoBalance] = useState<Record<string, number>>({});
  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  useEffect(() => {
    // Load wallet balance from localStorage
    const storedBalance = localStorage.getItem('walletBalance');
    if (storedBalance) {
      setWalletBalance(parseFloat(storedBalance));
    }
    
    // Load crypto holdings from localStorage
    const storedHoldings = localStorage.getItem('crypto_holdings');
    if (storedHoldings) {
      try {
        const parsedHoldings = JSON.parse(storedHoldings);
        setHoldings(parsedHoldings);
        
        // Convert holdings to balance format for calculations
        const balances: Record<string, number> = {};
        parsedHoldings.forEach((holding: any) => {
          balances[holding.symbol] = holding.quantity;
        });
        setCryptoBalance(balances);
      } catch (error) {
        console.error('Error parsing holdings data', error);
      }
    }
    
    // Load recent activity
    const storedActivity = localStorage.getItem('recent_activity');
    if (storedActivity) {
      try {
        const parsedActivity = JSON.parse(storedActivity);
        setRecentActivity(parsedActivity);
      } catch (error) {
        console.error('Error parsing activity data', error);
      }
    } else {
      // Generate mock activity if none exists
      generateMockActivity();
    }
  }, []);
  
  // Calculate portfolio value when tokens or holdings change
  useEffect(() => {
    if (!tokensLoading && tokens.length > 0 && Object.keys(cryptoBalance).length > 0) {
      // Calculate total portfolio value
      let cryptoValue = 0;
      
      Object.entries(cryptoBalance).forEach(([symbol, amount]) => {
        const token = tokens.find(t => t.symbol === symbol);
        if (token && token.price) {
          cryptoValue += (amount as number) * token.price;
        }
      });
      
      setTotalPortfolioValue(walletBalance + cryptoValue);
    } else {
      setTotalPortfolioValue(walletBalance);
    }
  }, [walletBalance, cryptoBalance, tokens, tokensLoading]);
  
  const generateMockActivity = () => {
    const types = ['Buy', 'Sell', 'Deposit', 'Withdrawal'];
    const statuses = ['Completed', 'Pending', 'Completed', 'Completed'];
    const symbols = ['BTC', 'ETH', 'SOL', 'USD'];
    const amounts = ['0.25 BTC', '1.5 ETH', '10 SOL', '$5,000.00'];
    
    const activity = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      activity.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: types[i],
        asset: symbols[i],
        amount: amounts[i],
        status: statuses[i]
      });
    }
    
    localStorage.setItem('recent_activity', JSON.stringify(activity));
    setRecentActivity(activity);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome back, {user?.name || user?.email?.split('@')[0]}</p>
          </div>
          
          {/* Portfolio Summary */}
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</h3>
                <p className="text-2xl font-bold text-white">${totalPortfolioValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Wallet Balance</h3>
                <p className="text-2xl font-bold text-white">${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Crypto Assets</h3>
                <p className="text-2xl font-bold text-white">${(totalPortfolioValue - walletBalance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Active Tokens</h3>
                <p className="text-2xl font-bold text-white">{tokens.filter(t => t.active).length}</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/trade" className="block">
                <div className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Trade</h3>
                      <p className="text-blue-200">Buy and sell crypto</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/portfolio" className="block">
                <div className="bg-purple-600 hover:bg-purple-700 transition-colors rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Portfolio</h3>
                      <p className="text-purple-200">Track your holdings</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/market" className="block">
                <div className="bg-green-600 hover:bg-green-700 transition-colors rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Market</h3>
                      <p className="text-green-200">View market trends</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Price Chart */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4">Market Overview</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 mb-6 md:mb-0 md:border-r md:border-gray-700 md:pr-6 md:mr-6">
                  <TokenList />
                </div>
                <div className="flex-1">
                  <ErrorBoundary>
                    <TradingChart />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Tokens */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4">Top Tokens</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Change (24h)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {tokensLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-300">
                          <div className="flex justify-center items-center">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading tokens...
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tokens
                        .filter(token => token.active)
                        .slice(0, 5)
                        .map((token) => (
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
                              ${token.price < 1 ? token.price.toFixed(4) : token.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                token.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <Link href={`/trade?token=${token.symbol}`} className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
                                Trade
                              </Link>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-gray-700 text-center">
                <Link href="/market" className="text-blue-400 hover:text-blue-300 font-medium">
                  View all tokens →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <p className="text-gray-400">Your latest transactions and orders</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{activity.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              activity.type === 'Buy' ? 'bg-green-100 text-green-800' : 
                              activity.type === 'Sell' ? 'bg-red-100 text-red-800' :
                              activity.type === 'Deposit' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {activity.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{activity.asset}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">{activity.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              activity.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-300">No recent activity found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-gray-700 text-center">
                <Link href="/profile" className="text-blue-400 hover:text-blue-300 font-medium">
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Admin Quick Access */}
          {user?.isAdmin && (
            <div className="mt-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Admin Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/tokens" className="inline-flex items-center px-4 py-2 border border-green-500 text-green-500 bg-gray-800 rounded-md hover:bg-green-500 hover:text-white transition-colors">
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Manage Tokens
                  </Link>
                  <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 bg-gray-800 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
    </ProtectedRoute>
  );
}
