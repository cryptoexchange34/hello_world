'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface OrderBookEntry {
  price: number;
  amount: number;
  type: 'buy' | 'sell';
}

export default function TradingPanel() {
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [currentPrice, setCurrentPrice] = useState(40000);
  const [orderBook, setOrderBook] = useState<OrderBookEntry[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize order book with some demo data
    const generateDemoOrderBook = () => {
      const demoOrderBook: OrderBookEntry[] = [];
      // Generate some sell orders (higher than current price)
      const sellBasePrice = currentPrice * 1.01;
      for (let i = 0; i < 4; i++) {
        demoOrderBook.push({
          price: sellBasePrice + (i * currentPrice * 0.001),
          amount: 0.1 + Math.random() * 0.4,
          type: 'sell'
        });
      }
      
      // Generate some buy orders (lower than current price)
      const buyBasePrice = currentPrice * 0.99;
      for (let i = 0; i < 4; i++) {
        demoOrderBook.push({
          price: buyBasePrice - (i * currentPrice * 0.001),
          amount: 0.1 + Math.random() * 0.4,
          type: 'buy'
        });
      }
      
      return demoOrderBook.sort((a, b) => b.price - a.price);
    };
    
    setOrderBook(generateDemoOrderBook());
    
    // Connect to WebSocket for real-time updates
    let socket: Socket | null = null;
    
    try {
      // Get the actual URL from window.location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = 3001;
      const wsUrl = `${protocol}//${host}:${port}`;
      
      console.log('Trading panel connecting to WebSocket at:', wsUrl);
      
      socket = io(wsUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
        transports: ['websocket', 'polling']
      });
      
      socket.on('connect', () => {
        console.log('Trading panel connected to WebSocket');
        setSocketConnected(true);
      });
      
      socket.on('connect_error', (err) => {
        console.error('Trading panel WebSocket error:', err);
        setSocketConnected(false);
      });
      
      socket.on('price-update', (data) => {
        if (data.symbol === 'btcusdt') {
          setCurrentPrice(data.price);
          
          // Update order book based on new price
          setOrderBook(prevOrderBook => {
            // Keep the structure but adjust prices slightly
            return prevOrderBook.map(entry => ({
              ...entry,
              price: entry.type === 'sell' 
                ? data.price * (1 + (Math.random() * 0.02)) 
                : data.price * (1 - (Math.random() * 0.02)),
              amount: 0.1 + Math.random() * 0.4
            })).sort((a, b) => b.price - a.price);
          });
        }
      });
    } catch (err) {
      console.error('Error setting up trading panel WebSocket:', err);
      // Demo data is already set
    }
    
    // Simulate order book updates if not connected to WebSocket
    const intervalRef = setInterval(() => {
      if (!socketConnected) {
        setOrderBook(prevOrderBook => {
          return prevOrderBook.map(entry => ({
            ...entry,
            price: entry.price * (1 + (Math.random() * 0.004 - 0.002)),
            amount: 0.1 + Math.random() * 0.4
          })).sort((a, b) => b.price - a.price);
        });
      }
    }, 3000);
    
    return () => {
      clearInterval(intervalRef);
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentPrice, socketConnected]);

  // Update amount when quantity changes
  useEffect(() => {
    if (quantity) {
      setAmount((parseFloat(quantity) * currentPrice).toFixed(2));
    } else {
      setAmount('');
    }
  }, [quantity, currentPrice]);

  // Update quantity when amount changes
  useEffect(() => {
    if (amount) {
      setQuantity((parseFloat(amount) / currentPrice).toFixed(6));
    } else {
      setQuantity('');
    }
  }, [amount, currentPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the order to your backend
    alert(`${orderType.toUpperCase()} order submitted: ${quantity} BTC at $${currentPrice.toFixed(2)} = $${amount}`);
    // Reset form
    setQuantity('');
    setAmount('');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Place Order</h3>
          <div className="text-sm">
            <span className="text-gray-400 mr-1">Current price:</span>
            <span className="font-medium">${currentPrice.toFixed(2)}</span>
            {socketConnected && <span className="ml-2 text-xs text-green-500">●</span>}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className={`flex-1 py-2 px-4 rounded ${
              orderType === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setOrderType('buy')}
          >
            Buy
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded ${
              orderType === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => setOrderType('sell')}
          >
            Sell
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Quantity (BTC)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-700 rounded p-2 text-white"
              placeholder="0.00"
              step="0.00001"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 rounded p-2 text-white"
              placeholder="0.00"
              step="1"
              min="0"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded font-medium ${
              orderType === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {orderType === 'buy' ? 'Buy' : 'Sell'} BTC
          </button>
        </form>
      </div>
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Order Book</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price (USD)</span>
            <span className="text-gray-400">Amount (BTC)</span>
          </div>
          {/* Order book entries */}
          <div className="max-h-[320px] overflow-y-auto space-y-1">
            {orderBook.map((order, index) => (
              <div 
                key={index} 
                className="flex justify-between text-sm"
              >
                <span className={order.type === 'sell' ? 'text-red-500' : 'text-green-500'}>
                  ${order.price.toFixed(2)}
                </span>
                <span>{order.amount.toFixed(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 