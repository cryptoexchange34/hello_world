'use client';

import { useState, useEffect } from 'react';

interface Trade {
  id: string;
  symbol: string;
  price: number;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: number;
}

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Generate demo trades
    const generateDemoTrades = (): Trade[] => {
      const demoTrades: Trade[] = [];
      const now = Date.now();
      
      // Create some historical trades
      for (let i = 0; i < 30; i++) {
        const isBuy = Math.random() > 0.5;
        const price = 40000 + (Math.random() * 500 - 250);
        
        demoTrades.push({
          id: `trade-${i}`,
          symbol: 'BTC/USDT',
          price,
          amount: 0.01 + Math.random() * 0.2,
          type: isBuy ? 'buy' : 'sell',
          timestamp: now - (i * 60000) // Each trade is 1 minute apart
        });
      }
      
      return demoTrades.sort((a, b) => b.timestamp - a.timestamp);
    };
    
    setTrades(generateDemoTrades());
    
    // Simulate new trades coming in
    const intervalId = setInterval(() => {
      const isBuy = Math.random() > 0.5;
      const price = 40000 + (Math.random() * 500 - 250);
      
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        symbol: 'BTC/USDT',
        price,
        amount: 0.01 + Math.random() * 0.2,
        type: isBuy ? 'buy' : 'sell',
        timestamp: Date.now()
      };
      
      setTrades(prevTrades => {
        const updatedTrades = [newTrade, ...prevTrades];
        // Keep only the last 50 trades
        return updatedTrades.slice(0, 50);
      });
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700 bg-slate-800">
        <h2 className="text-lg font-medium text-slate-200">Trade History</h2>
      </div>
      
      <div className="overflow-y-auto h-full">
        <table className="min-w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    ${trade.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-slate-300">
                  {trade.amount.toFixed(4)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-slate-400">
                  {formatTime(trade.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 