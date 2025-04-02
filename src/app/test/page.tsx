'use client';

import React, { useState } from 'react';

export default function TestPage() {
  const [connected, setConnected] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Crypto Trading Panel - Test Page</h1>
      <div className="bg-gray-800 p-6 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Server Status</h2>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <button 
          onClick={async () => {
            try {
              const res = await fetch('/api/test');
              if (res.ok) {
                setConnected(true);
              }
            } catch (error) {
              console.error('Error connecting to server:', error);
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sample Token List</h2>
          <div className="space-y-2">
            {[
              { symbol: 'BTC', price: 40000, change: 0.5 },
              { symbol: 'ETH', price: 3500, change: 1.2 },
              { symbol: 'BNB', price: 784, change: 0.2 },
              { symbol: 'SOL', price: 150, change: -0.5 },
              { symbol: 'XRP', price: 0.5, change: -1.0 },
            ].map(token => (
              <div key={token.symbol} className="flex justify-between p-3 bg-gray-700 rounded">
                <div>
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-sm text-gray-400">${token.price.toFixed(2)}</div>
                </div>
                <div className={`${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.change >= 0 ? '+' : ''}{token.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Trade Panel Preview</h2>
          <div className="flex space-x-4 mb-4">
            <button className="flex-1 py-2 bg-green-500 text-white rounded">Buy</button>
            <button className="flex-1 py-2 bg-gray-700 text-gray-200 rounded">Sell</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quantity</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 p-2 rounded text-white" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount (USD)</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 p-2 rounded text-white" 
                placeholder="0.00"
              />
            </div>
            <button className="w-full py-2 bg-green-500 text-white rounded mt-3">Buy BTC</button>
          </div>
        </div>
      </div>
    </div>
  );
} 