'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTokens } from '@/context/TokenContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Order {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export default function TradePage() {
  const { user } = useAuth();
  const { activeTokens, getToken } = useTokens();
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number>(40293.25);
  const [walletBalance, setWalletBalance] = useState<number>(10000);
  const [cryptoBalance, setCryptoBalance] = useState<Record<string, number>>({
    BTC: 0.5,
    ETH: 2.0,
    SOL: 10.0,
    BNB: 1.5,
    XRP: 100.0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load wallet balance & order history from localStorage
  useEffect(() => {
    const storedBalance = localStorage.getItem('walletBalance');
    if (storedBalance) {
      setWalletBalance(parseFloat(storedBalance));
    }
    
    const storedCryptoBalance = localStorage.getItem('cryptoBalance');
    if (storedCryptoBalance) {
      setCryptoBalance(JSON.parse(storedCryptoBalance));
    }
    
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      // Create some mock data for demo
      const mockOrders: Order[] = [
        {
          id: '1',
          type: 'buy',
          symbol: 'BTC',
          amount: 0.25,
          price: 38945.10,
          total: 9736.28,
          status: 'completed',
          date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        },
        {
          id: '2',
          type: 'sell',
          symbol: 'ETH',
          amount: 1.5,
          price: 2310.75,
          total: 3466.13,
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: '3',
          type: 'buy',
          symbol: 'SOL',
          amount: 10,
          price: 103.45,
          total: 1034.50,
          status: 'pending',
          date: new Date().toISOString(),
        },
      ];
      setOrders(mockOrders);
      localStorage.setItem('orders', JSON.stringify(mockOrders));
    }
  }, []);

  // Update current price when selected crypto changes
  useEffect(() => {
    const token = getToken(selectedCrypto);
    if (token) {
      setCurrentPrice(token.price);
    }
    
    // Clear form
    setAmount('');
    setError('');
    setSuccess('');
  }, [selectedCrypto, getToken]);

  const handleCryptoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCrypto(e.target.value);
  };

  const handleOrderTypeChange = (type: 'buy' | 'sell') => {
    setOrderType(type);
    // Clear form
    setAmount('');
    setError('');
    setSuccess('');
  };

  const getTotal = (): number => {
    return parseFloat(amount || '0') * currentPrice;
  };

  const validateOrder = (): boolean => {
    const parsedAmount = parseFloat(amount);
    
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (orderType === 'buy') {
      const total = parsedAmount * currentPrice;
      if (total > walletBalance) {
        setError('Insufficient funds in your wallet');
        return false;
      }
    } else {
      // Check if user has enough crypto to sell
      const availableCrypto = cryptoBalance[selectedCrypto] || 0;
      if (parsedAmount > availableCrypto) {
        setError(`Insufficient ${selectedCrypto} balance`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateOrder()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        const parsedAmount = parseFloat(amount);
        const total = parsedAmount * currentPrice;
        
        // Update balances
        let newWalletBalance = walletBalance;
        const newCryptoBalance = { ...cryptoBalance };
        
        if (orderType === 'buy') {
          // Deduct from wallet, add to crypto
          newWalletBalance -= total;
          newCryptoBalance[selectedCrypto] = (newCryptoBalance[selectedCrypto] || 0) + parsedAmount;
        } else {
          // Add to wallet, deduct from crypto
          newWalletBalance += total;
          newCryptoBalance[selectedCrypto] = (newCryptoBalance[selectedCrypto] || 0) - parsedAmount;
        }
        
        // Create new order
        const newOrder: Order = {
          id: Date.now().toString(),
          type: orderType,
          symbol: selectedCrypto,
          amount: parsedAmount,
          price: currentPrice,
          total: total,
          status: 'completed',
          date: new Date().toISOString(),
        };
        
        // Update state
        setWalletBalance(newWalletBalance);
        setCryptoBalance(newCryptoBalance);
        setOrders([newOrder, ...orders]);
        setAmount('');
        
        // Update localStorage
        localStorage.setItem('walletBalance', newWalletBalance.toString());
        localStorage.setItem('cryptoBalance', JSON.stringify(newCryptoBalance));
        localStorage.setItem('orders', JSON.stringify([newOrder, ...orders]));
        
        setSuccess(`${orderType === 'buy' ? 'Bought' : 'Sold'} ${parsedAmount} ${selectedCrypto} successfully!`);
      } catch (err) {
        setError('An error occurred while processing your order');
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Trade Cryptocurrency</h1>
            <p className="mt-2 text-gray-400">Buy and sell crypto at the best rates</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trading Form */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex">
                    <button
                      className={`flex-1 py-2 text-center rounded-l-md ${
                        orderType === 'buy'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                      onClick={() => handleOrderTypeChange('buy')}
                    >
                      Buy
                    </button>
                    <button
                      className={`flex-1 py-2 text-center rounded-r-md ${
                        orderType === 'sell'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                      onClick={() => handleOrderTypeChange('sell')}
                    >
                      Sell
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm font-medium mb-2">Select Cryptocurrency</label>
                      <select
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedCrypto}
                        onChange={handleCryptoChange}
                      >
                        {activeTokens.map((token) => (
                          <option key={token.id} value={token.symbol}>
                            {token.name} ({token.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-gray-400 text-sm font-medium">Amount ({selectedCrypto})</label>
                        {orderType === 'sell' && (
                          <span className="text-sm text-gray-400">
                            Available: {(cryptoBalance[selectedCrypto] || 0).toFixed(8)} {selectedCrypto}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.00000001"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${selectedCrypto} amount`}
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError('');
                          setSuccess('');
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between py-3 px-4 bg-gray-700 rounded mb-4">
                      <span className="text-gray-400">Price</span>
                      <span className="text-white font-medium">${currentPrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between py-3 px-4 bg-gray-700 rounded mb-4">
                      <span className="text-gray-400">Total</span>
                      <span className="text-white font-medium">${getTotal().toLocaleString()}</span>
                    </div>
                    
                    {error && (
                      <div className="p-3 mb-4 text-sm bg-red-900/50 border border-red-800 text-red-200 rounded">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="p-3 mb-4 text-sm bg-green-900/50 border border-green-800 text-green-200 rounded">
                        {success}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        Wallet Balance: <span className="text-white font-medium">${walletBalance.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 px-4 rounded font-medium transition-colors ${
                        isSubmitting
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : orderType === 'buy'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selectedCrypto}`
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Market Information & Order History */}
            <div className="lg:col-span-2">
              {/* Asset Information */}
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">Your Assets</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-3">$</div>
                            <div className="text-sm font-medium text-white">USD Balance</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">${walletBalance.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">${walletBalance.toLocaleString()}</td>
                      </tr>
                      {Object.entries(cryptoBalance).map(([symbol, balance]) => {
                        const token = getToken(symbol);
                        const price = token?.price || 0;
                        const value = balance * price;
                        return (
                          <tr key={symbol}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                  {symbol.charAt(0)}
                                </div>
                                <div className="text-sm font-medium text-white">{token?.name || symbol}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">
                              {balance.toFixed(8)} {symbol}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">
                              ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Order History */}
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">Order History</h2>
                </div>
                
                <div className="overflow-x-auto">
                  {orders.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <p>No orders yet. Start trading to see your order history.</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(order.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {order.type === 'buy' ? 'Buy' : 'Sell'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{order.symbol}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">{order.amount.toFixed(8)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-300">${order.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">${order.total.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
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
        </div>
      </div>
    </ProtectedRoute>
  );
} 