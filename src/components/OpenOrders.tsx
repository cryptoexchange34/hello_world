'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: number;
}

export default function OpenOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Generate some demo orders
    const generateDemoOrders = (): Order[] => {
      const demoOrders: Order[] = [
        {
          id: 'ord-1',
          symbol: 'BTC/USDT',
          type: 'buy',
          price: 39850.00,
          amount: 0.15,
          timestamp: Date.now() - 1000 * 60 * 30
        },
        {
          id: 'ord-2',
          symbol: 'ETH/USDT',
          type: 'sell',
          price: 2280.00,
          amount: 0.75,
          timestamp: Date.now() - 1000 * 60 * 15
        }
      ];
      return demoOrders;
    };

    setOrders(generateDemoOrders());
  }, []);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const cancelOrder = (id: string) => {
    // In a real app, this would send a request to cancel the order
    setOrders(orders.filter(order => order.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700 bg-slate-800">
        <h2 className="text-lg font-medium text-slate-200">Open Orders</h2>
      </div>
      
      <div className="overflow-y-auto h-full p-2">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No open orders
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-slate-800 rounded-md p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{order.symbol}</span>
                  <span className={`text-xs ${order.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {order.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-400">Price:</span>
                  <span>${order.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-400">Amount:</span>
                  <span>{order.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-slate-400">Time:</span>
                  <span>{formatTime(order.timestamp)}</span>
                </div>
                <button 
                  onClick={() => cancelOrder(order.id)}
                  className="w-full text-center py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 