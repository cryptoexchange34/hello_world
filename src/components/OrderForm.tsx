'use client';

import { useState, useEffect } from 'react';

export default function OrderForm() {
  const [testInput, setTestInput] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(10000); // Default $10,000 balance
  const [tokenBalance, setTokenBalance] = useState(0); // Default 0 BTC balance
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [currentPrice, setCurrentPrice] = useState(40000); // Default price for BTC
  const [isManualQuantityChange, setIsManualQuantityChange] = useState(false);
  const [isManualAmountChange, setIsManualAmountChange] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState('B'); // Default to Bitcoin
  
  // Load wallet balance from localStorage on component mount
  useEffect(() => {
    try {
      const savedWalletBalance = localStorage.getItem('walletBalance');
      if (savedWalletBalance) {
        const parsedBalance = parseFloat(savedWalletBalance);
        if (!isNaN(parsedBalance)) {
          setWalletBalance(parsedBalance);
          console.log('Loaded wallet balance:', parsedBalance);
        }
      }
      
      const savedTokenBalance = localStorage.getItem('btcBalance');
      if (savedTokenBalance) {
        const parsedBalance = parseFloat(savedTokenBalance);
        if (!isNaN(parsedBalance)) {
          setTokenBalance(parsedBalance);
          console.log('Loaded BTC balance:', parsedBalance);
        }
      }
    } catch (e) {
      console.error('Error loading balances from localStorage:', e);
    }
  }, []);
  
  // Calculate amount when quantity changes
  useEffect(() => {
    if (isManualQuantityChange && quantity && !isNaN(parseFloat(quantity))) {
      const calculatedAmount = (parseFloat(quantity) * currentPrice).toFixed(2);
      setAmount(calculatedAmount);
      setIsManualQuantityChange(false);
    }
  }, [quantity, currentPrice, isManualQuantityChange]);

  // Calculate quantity when amount changes
  useEffect(() => {
    if (isManualAmountChange && amount && !isNaN(parseFloat(amount))) {
      if (currentPrice <= 0) return;
      const calculatedQuantity = (parseFloat(amount) / currentPrice).toFixed(8);
      setQuantity(calculatedQuantity);
      setIsManualAmountChange(false);
    }
  }, [amount, currentPrice, isManualAmountChange]);
  
  // Listen for token price updates
  useEffect(() => {
    const handleTokenPriceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { symbol, price } = customEvent.detail;
      console.log('OrderForm received price update:', symbol, price);
      
      setSelectedTokenSymbol(symbol);
      setCurrentPrice(price);
    };
    
    window.addEventListener('token-price-update', handleTokenPriceUpdate);
    
    return () => {
      window.removeEventListener('token-price-update', handleTokenPriceUpdate);
    };
  }, []);
  
  // Get token name based on symbol
  const getTokenName = (symbol: string): string => {
    const tokenNames: Record<string, string> = {
      'B': 'Bitcoin',
      'Ξ': 'Ethereum',
      '₮': 'Tether',
      'L': 'Litecoin',
      'S': 'Solana',
      'A': 'Cardano',
      'D': 'Dogecoin',
      'P': 'Polkadot',
      'C': 'Chainlink',
      'U': 'Uniswap'
    };
    
    return tokenNames[symbol] || symbol;
  };
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const qtyValue = parseFloat(quantity);
    const amtValue = parseFloat(amount);
    
    if (isNaN(qtyValue) || isNaN(amtValue)) {
      setNotification({
        message: 'Please enter valid quantity and amount values',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        if (orderType === 'buy') {
          // Check if user has enough wallet balance
          if (amtValue > walletBalance) {
            setNotification({
              message: `Insufficient funds. Your balance: $${walletBalance.toFixed(2)}`,
              type: 'error'
            });
            return;
          }
          
          // Update balances
          const newWalletBalance = walletBalance - amtValue;
          const newTokenBalance = tokenBalance + qtyValue;
          
          setWalletBalance(newWalletBalance);
          setTokenBalance(newTokenBalance);
          
          // Save to localStorage
          localStorage.setItem('walletBalance', newWalletBalance.toString());
          localStorage.setItem('btcBalance', newTokenBalance.toString());
          
          setNotification({
            message: `Successfully bought ${qtyValue.toFixed(6)} BTC for $${amtValue.toFixed(2)}`,
            type: 'success'
          });
        } else {
          // Check if user has enough token balance
          if (qtyValue > tokenBalance) {
            setNotification({
              message: `Insufficient BTC. Your balance: ${tokenBalance.toFixed(6)} BTC`,
              type: 'error'
            });
            return;
          }
          
          // Update balances
          const newWalletBalance = walletBalance + amtValue;
          const newTokenBalance = tokenBalance - qtyValue;
          
          setWalletBalance(newWalletBalance);
          setTokenBalance(newTokenBalance);
          
          // Save to localStorage
          localStorage.setItem('walletBalance', newWalletBalance.toString());
          localStorage.setItem('btcBalance', newTokenBalance.toString());
          
          setNotification({
            message: `Successfully sold ${qtyValue.toFixed(6)} BTC for $${amtValue.toFixed(2)}`,
            type: 'success'
          });
        }
        
        // Reset form
        setQuantity('');
        setAmount('');
      } catch (e) {
        console.error('Error processing order:', e);
        setNotification({
          message: 'An error occurred while processing your order',
          type: 'error'
        });
      } finally {
        setIsProcessing(false);
      }
    }, 800); // Simulate processing time
  };
  
  // Toggle between buy and sell
  const toggleOrderType = (type: 'buy' | 'sell') => {
    setOrderType(type);
  };
  
  console.log('Rendering OrderForm with values:', { testInput, quantity, amount });
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg text-white">
      <h2 className="text-lg font-medium text-white mb-4">Place Order</h2>
      
      {/* Current Price */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-300">{getTokenName(selectedTokenSymbol)} Price:</span>
        <span className="text-xl font-bold">${currentPrice.toFixed(2)}</span>
      </div>
      
      {/* Balance Display */}
      <div className="border-b border-gray-600 pb-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-300 text-sm">Wallet Balance:</span>
          <span className="text-white font-medium wallet-balance-display">${walletBalance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-gray-300 text-sm">{getTokenName(selectedTokenSymbol)} Balance:</span>
          <span className="text-white font-medium">{tokenBalance.toFixed(6)} {selectedTokenSymbol}</span>
        </div>
      </div>
      
      {/* Buy/Sell Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            orderType === 'buy'
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => toggleOrderType('buy')}
        >
          Buy
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            orderType === 'sell'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => toggleOrderType('sell')}
        >
          Sell
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="test-input" className="block text-sm font-medium text-white mb-1">
            Test Input
          </label>
          <input
            id="test-input"
            type="text"
            value={testInput}
            onChange={(e) => {
              console.log('Test input changed:', e.target.value);
              setTestInput(e.target.value);
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white"
            placeholder="Test input"
          />
        </div>
        
        <div>
          <label htmlFor="quantity-input" className="block text-sm font-medium text-white mb-1">
            Quantity ({selectedTokenSymbol})
          </label>
          <input
            id="quantity-input"
            type="text"
            value={quantity}
            onChange={(e) => {
              console.log('Quantity changed:', e.target.value);
              setQuantity(e.target.value);
              setIsManualQuantityChange(true);
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label htmlFor="amount-input" className="block text-sm font-medium text-white mb-1">
            Amount (USD)
          </label>
          <input
            id="amount-input"
            type="text"
            value={amount}
            onChange={(e) => {
              console.log('Amount changed:', e.target.value);
              setAmount(e.target.value);
              setIsManualAmountChange(true);
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white"
            placeholder="0.00"
          />
        </div>
        
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            orderType === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isProcessing}
        >
          {isProcessing 
            ? 'Processing...' 
            : orderType === 'buy' ? `Buy ${selectedTokenSymbol}` : `Sell ${selectedTokenSymbol}`
          }
        </button>
      </form>
      
      {/* Notification */}
      {notification && (
        <div className={`mt-4 p-3 rounded-md ${
          notification.type === 'success' ? 'bg-green-800' : 'bg-red-800'
        }`}>
          <p className="text-sm">{notification.message}</p>
        </div>
      )}
      
      <div className="mt-4 p-2 border border-gray-600 rounded">
        <p>Order Info:</p>
        <p>Type: {orderType === 'buy' ? 'Buy' : 'Sell'}</p>
        <p>Quantity: {quantity || '0.00'} {selectedTokenSymbol}</p>
        <p>Amount: ${amount || '0.00'}</p>
      </div>
    </div>
  );
} 