'use client';

import { useState, useEffect, useRef } from 'react';
import { useTokens } from '@/context/TokenContext';

// Generate random price data for testing
const generateDummyData = (numPoints = 30, basePrice = 40000) => {
  return Array.from({ length: numPoints }, (_, i) => {
    const randomVariation = (Math.random() - 0.5) * 0.01 * basePrice;
    const trendFactor = Math.sin(i / 10) * 0.005 * basePrice;
    return {
      price: basePrice + randomVariation + trendFactor + (i * basePrice * 0.001),
      time: Date.now() - (numPoints - i) * 60000 // One point per minute
    };
  });
};

// Token price map to use realistic base prices
const tokenBasePrices: Record<string, number> = {
  'B': 40000,    // Bitcoin
  'Ξ': 3500,     // Ethereum
  '₮': 1,        // Tether
  'L': 75,       // Litecoin
  'S': 140,      // Solana
  'A': 0.45,     // Cardano
  'D': 0.12,     // Dogecoin
  'P': 6.8,      // Polkadot
  'C': 14.5,     // Chainlink
  'U': 8.7       // Uniswap
};

// Token name map
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

export default function TradingChart() {
  const { tokens, getToken } = useTokens();
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [chartData, setChartData] = useState<{price: number, time: number}[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize with the first token if none selected
  useEffect(() => {
    if (!selectedToken && tokens.length > 0) {
      const activeToken = tokens.find(t => t.active);
      if (activeToken) {
        setSelectedToken(activeToken.symbol);
        setTokenName(activeToken.name);
        setCurrentPrice(activeToken.price);
        setPriceChange(activeToken.change24h);
        setChartData(generateDummyData(30, activeToken.price));
      }
    }
  }, [tokens, selectedToken]);
  
  // Function to draw the chart
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Calculate min and max prices for scaling
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.998; // Add 0.2% padding
    const maxPrice = Math.max(...prices) * 1.002;
    const priceRange = maxPrice - minPrice;
    
    // Calculate scaling factors
    const xScale = rect.width / (chartData.length - 1);
    const yScale = rect.height / priceRange;
    
    // Draw price line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // Blue line
    
    chartData.forEach((point, i) => {
      const x = i * xScale;
      const y = rect.height - ((point.price - minPrice) * yScale);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Fill area under the line
    ctx.lineTo(rect.width, rect.height);
    ctx.lineTo(0, rect.height);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // Light blue fill
    ctx.fill();
    
    // Draw price labels
    ctx.fillStyle = '#9ca3af'; // Gray text
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    
    // Draw high price
    ctx.fillText('$' + maxPrice.toFixed(2), rect.width - 5, 15);
    
    // Draw low price
    ctx.fillText('$' + minPrice.toFixed(2), rect.width - 5, rect.height - 5);
    
    // Draw current price line
    const currentY = rect.height - ((currentPrice - minPrice) * yScale);
    ctx.beginPath();
    ctx.strokeStyle = priceChange >= 0 ? '#10b981' : '#ef4444'; // Green or red line
    ctx.setLineDash([5, 3]);
    ctx.moveTo(0, currentY);
    ctx.lineTo(rect.width, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw current price label
    ctx.fillStyle = priceChange >= 0 ? '#10b981' : '#ef4444'; // Green or red text
    ctx.textAlign = 'left';
    ctx.fillText('$' + currentPrice.toFixed(2), 5, currentY - 5);
  };
  
  // Listen for token selection
  useEffect(() => {
    const handleTokenSelection = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { symbol, price, change } = customEvent.detail;
      
      // Only update if different token
      if (symbol !== selectedToken) {
        setSelectedToken(symbol);
        
        // Get token data
        const token = getToken(symbol);
        if (token) {
          setTokenName(token.name);
        }
        
        // Clear existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Set price and change
        const tokenPrice = price || token?.price || 0;
        setCurrentPrice(tokenPrice);
        setPriceChange(change || token?.change24h || 0);
        
        // Generate new chart data based on the token's price range
        setChartData(generateDummyData(30, tokenPrice));
      }
    };
    
    window.addEventListener('token-selected', handleTokenSelection);
    
    return () => {
      window.removeEventListener('token-selected', handleTokenSelection);
    };
  }, [selectedToken, getToken]);
  
  // Listen for price updates
  useEffect(() => {
    const handlePriceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { symbol, price, change } = customEvent.detail;
      
      // Only update if it's for the selected token
      if (symbol === selectedToken && price) {
        setCurrentPrice(price);
        if (change !== undefined) {
          setPriceChange(change);
        }
        
        // Add the new price point to the chart data
        setChartData(prev => {
          const newData = [...prev, { price, time: Date.now() }];
          // Keep only last 30 points
          if (newData.length > 30) {
            return newData.slice(-30);
          }
          return newData;
        });
      }
    };
    
    window.addEventListener('token-price-update', handlePriceUpdate);
    
    return () => {
      window.removeEventListener('token-price-update', handlePriceUpdate);
    };
  }, [selectedToken]);
  
  // Draw chart when data changes
  useEffect(() => {
    if (chartData.length > 0) {
      drawChart();
    }
  }, [chartData, currentPrice]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // If no token is selected yet, show loading state
  if (!selectedToken || !tokenName) {
    return (
      <div className="flex flex-col p-4 bg-gray-800 rounded-lg shadow-lg text-white">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col p-4 bg-gray-800 rounded-lg shadow-lg text-white">
      <h2 className="text-lg font-medium text-white mb-4">{tokenName} Price Chart</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(2)}</div>
        <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden bg-gray-850 min-h-[300px] relative">
        <canvas ref={canvasRef} className="w-full h-full min-h-[300px]"></canvas>
        
        {chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p>Loading chart data...</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Displaying price data for the last 30 minutes
      </div>
    </div>
  );
} 