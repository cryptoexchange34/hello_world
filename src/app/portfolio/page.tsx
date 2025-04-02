'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTokens } from '@/context/TokenContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface CryptoHolding {
  asset: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const { tokens } = useTokens();
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch the user's holdings from an API
    // For this demo, we'll generate some mock holdings based on available tokens
    if (tokens.length > 0) {
      // Get user's wallet data from localStorage if it exists
      const walletData = localStorage.getItem('crypto_holdings');
      
      if (walletData) {
        try {
          const parsedHoldings = JSON.parse(walletData);
          
          // Update holdings with current prices from tokens
          const updatedHoldings = parsedHoldings.map((holding: any) => {
            const token = tokens.find(t => t.symbol === holding.symbol);
            return {
              ...holding,
              currentPrice: token?.price || holding.currentPrice
            };
          });
          
          setHoldings(updatedHoldings);
        } catch (error) {
          console.error('Error parsing holdings data', error);
          generateMockHoldings();
        }
      } else {
        generateMockHoldings();
      }
      
      setIsLoading(false);
    }
  }, [tokens]);

  const generateMockHoldings = () => {
    // Only use active tokens for mock holdings
    const activeTokens = tokens.filter(token => token.active);
    
    if (activeTokens.length === 0) return;
    
    // Create 3-5 random holdings
    const numberOfHoldings = Math.floor(Math.random() * 3) + 3;
    const mockHoldings: CryptoHolding[] = [];
    
    // Create a set to track which tokens we've already used
    const usedTokens = new Set<string>();
    
    for (let i = 0; i < numberOfHoldings && i < activeTokens.length; i++) {
      // Pick a random token we haven't used yet
      let randomIndex;
      let tokenSymbol;
      
      do {
        randomIndex = Math.floor(Math.random() * activeTokens.length);
        tokenSymbol = activeTokens[randomIndex].symbol;
      } while (usedTokens.has(tokenSymbol) && usedTokens.size < activeTokens.length);
      
      if (usedTokens.size >= activeTokens.length) break;
      
      usedTokens.add(tokenSymbol);
      
      const token = activeTokens[randomIndex];
      const quantity = parseFloat((Math.random() * 10 + 0.1).toFixed(token.price > 100 ? 2 : 4));
      const averageBuyPrice = token.price * (0.8 + Math.random() * 0.4); // +/- 20% of current price
      
      mockHoldings.push({
        asset: token.name,
        symbol: token.symbol,
        quantity,
        averageBuyPrice,
        currentPrice: token.price
      });
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('crypto_holdings', JSON.stringify(mockHoldings));
    setHoldings(mockHoldings);
  };

  useEffect(() => {
    if (holdings.length > 0) {
      // Calculate total value and profit
      let value = 0;
      let cost = 0;
      
      holdings.forEach(holding => {
        const holdingValue = holding.quantity * holding.currentPrice;
        const holdingCost = holding.quantity * holding.averageBuyPrice;
        value += holdingValue;
        cost += holdingCost;
      });
      
      setTotalValue(value);
      setTotalProfit(value - cost);
    }
  }, [holdings]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Your Portfolio</h1>
            <Link href="/trade" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Trade
            </Link>
          </div>
          
          {/* Portfolio Summary */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">Portfolio Summary</h2>
              <p className="text-gray-400">Overview of your crypto assets</p>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="text-center text-gray-400">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading your portfolio...</p>
                </div>
              ) : holdings.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-white mb-2">No Assets Found</h3>
                  <p className="text-gray-400 mb-4">You don't have any cryptocurrency in your portfolio yet.</p>
                  <Link href="/trade" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Start Trading
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</h3>
                      <p className="text-2xl font-bold text-white">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Total Profit/Loss</h3>
                      <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Assets</h3>
                      <p className="text-2xl font-bold text-white">{holdings.length}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Holdings</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Avg. Buy Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Current Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Profit/Loss</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {holdings.map((holding, index) => {
                          const value = holding.quantity * holding.currentPrice;
                          const cost = holding.quantity * holding.averageBuyPrice;
                          const profit = value - cost;
                          const profitPercentage = (profit / cost) * 100;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-750">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                    {holding.symbol.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-white">{holding.asset}</div>
                                    <div className="text-sm text-gray-400">{holding.symbol}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">
                                {holding.quantity < 1 ? holding.quantity.toFixed(4) : holding.quantity.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">
                                ${holding.averageBuyPrice < 1 ? holding.averageBuyPrice.toFixed(4) : holding.averageBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">
                                ${holding.currentPrice < 1 ? holding.currentPrice.toFixed(4) : holding.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white font-medium">
                                ${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div>
                                  <span className={`text-sm ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {profit >= 0 ? '+' : ''}{profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                  <span className={`block text-xs ${profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <Link href={`/trade?token=${holding.symbol}`} className="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
                                  Trade
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Price Alerts - Premium Feature */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Price Alerts</h2>
                  <p className="text-gray-400">Get notified when prices reach your targets</p>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-xs text-white font-medium rounded-full">PREMIUM</span>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-xl font-medium text-white mb-2">Upgrade to Premium</h3>
              <p className="text-gray-400 mb-4">Set price alerts and get notified when cryptocurrencies reach your target prices.</p>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 