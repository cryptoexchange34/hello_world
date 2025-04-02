'use client';

import { useState, useEffect, useRef } from 'react';
import { useTokens } from '@/context/TokenContext';

// Generate a random price change within a reasonable range
const getRandomPriceChange = (currentPrice: number) => {
  const changePercent = (Math.random() * 0.5) - 0.25; // -0.25% to +0.25%
  return currentPrice * (1 + changePercent / 100);
};

// Debounce function to prevent rapid successive token selections
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export default function TokenList() {
  const { tokens, activeTokens, updateTokenPrice } = useTokens();
  const [selectedToken, setSelectedToken] = useState('');
  const [displayTokens, setDisplayTokens] = useState<any[]>([]);
  const [numTokens, setNumTokens] = useState(5); // Default to show 5 tokens
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const isUpdating = useRef(false);
  const pendingTokenSelection = useRef<string | null>(null);

  // Initialize tokens and selected token
  useEffect(() => {
    if (activeTokens.length > 0 && !selectedToken) {
      // Set initial selected token
      setSelectedToken(activeTokens[0].symbol);
      
      // Initialize display tokens
      updateDisplayTokens();
    }
  }, [activeTokens, selectedToken]);

  // Update displayed tokens when active tokens change
  const updateDisplayTokens = () => {
    // Get all active tokens sorted by market cap (price * some factor for demo)
    const sorted = [...activeTokens]
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, numTokens);
    
    setDisplayTokens(sorted);
  };

  // Track previous prices for accurate change calculation
  useEffect(() => {
    // Initialize previous prices
    const initialPrices: Record<string, number> = {};
    activeTokens.forEach(token => {
      initialPrices[token.symbol] = token.price;
    });
    setPreviousPrices(initialPrices);
  }, [activeTokens]);

  // Real-time price updates
  useEffect(() => {
    let lastPrices = {...previousPrices};
    
    const interval = setInterval(() => {
      // Skip update if another operation is in progress
      if (isUpdating.current) {
        return;
      }
      
      activeTokens.forEach(token => {
        // Store previous price for this token if not already stored
        if (!lastPrices[token.symbol]) {
          lastPrices[token.symbol] = token.price;
        }
        
        // Generate a random price change within a reasonable range
        const changePercent = (Math.random() * 0.5) - 0.25; // -0.25% to +0.25%
        const newPrice = token.price * (1 + changePercent / 100);
        
        // Calculate change based on previous stored price
        const prevPrice = lastPrices[token.symbol];
        const priceChange = ((newPrice - prevPrice) / prevPrice) * 100;
        
        // Update to new price for next iteration
        lastPrices[token.symbol] = newPrice;
        
        // Update token price in context
        updateTokenPrice(token.symbol, newPrice, token.change24h + priceChange * 0.1);
        
        // If this is the selected token, emit a price update event
        if (token.symbol === selectedToken) {
          try {
            // Dispatch updated token price
            const event = new CustomEvent('token-price-update', {
              detail: { 
                symbol: selectedToken, 
                price: newPrice,
                change: token.change24h + priceChange * 0.1,
                isPositive: (token.change24h + priceChange * 0.1) >= 0
              }
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.error('TokenList: Error emitting price update:', error);
          }
        }
      });
      
      // Process any pending token selection after price update
      if (pendingTokenSelection.current) {
        const symbol = pendingTokenSelection.current;
        pendingTokenSelection.current = null;
        debouncedEmitTokenSelection(symbol);
      }
      
      // Update previous prices state
      setPreviousPrices(lastPrices);
      
      // Refresh display tokens
      updateDisplayTokens();
      
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedToken, previousPrices, activeTokens, updateTokenPrice]);

  // Initialize selected token on load
  useEffect(() => {
    // Listen for request to send current token
    const handleTokenRequest = () => {
      try {
        // Find the selected token data
        const selectedTokenData = activeTokens.find(token => token.symbol === selectedToken);
        
        if (selectedTokenData) {
          // Dispatch current token with price data
          const event = new CustomEvent('token-selected', {
            detail: { 
              symbol: selectedToken,
              price: selectedTokenData.price || 0,
              change: selectedTokenData.change24h || 0,
              isPositive: (selectedTokenData.change24h || 0) >= 0
            }
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('TokenList: Error sending current token:', error);
      }
    };

    window.addEventListener('request-current-token', handleTokenRequest);

    // Trigger chart update for initial token on component mount after a small delay
    if (selectedToken) {
      setTimeout(() => emitTokenSelection(selectedToken), 500);
    }

    return () => {
      window.removeEventListener('request-current-token', handleTokenRequest);
    };
  }, [selectedToken, activeTokens]);

  // Function to emit token selection event
  const emitTokenSelection = (symbol: string) => {
    // If an update is already in progress, queue this selection
    if (isUpdating.current) {
      pendingTokenSelection.current = symbol;
      return;
    }
    
    isUpdating.current = true;
    
    // Find the token data
    const tokenData = activeTokens.find(token => token.symbol === symbol);
    
    // Dispatch a custom event that the chart component can listen for
    try {
      const event = new CustomEvent('token-selected', {
        detail: { 
          symbol,
          price: tokenData?.price || 0,
          change: tokenData?.change24h || 0,
          isPositive: (tokenData?.change24h || 0) >= 0
        }
      });
      window.dispatchEvent(event);
      
      // Set a timeout to reset the updating flag
      setTimeout(() => {
        isUpdating.current = false;
        
        // Process any pending token selection
        if (pendingTokenSelection.current) {
          const pendingSymbol = pendingTokenSelection.current;
          pendingTokenSelection.current = null;
          debouncedEmitTokenSelection(pendingSymbol);
        }
      }, 500);
    } catch (error) {
      console.error('TokenList: Error dispatching event:', error);
      isUpdating.current = false;
    }
  };
  
  // Create a debounced version of the token selection function
  const debouncedEmitTokenSelection = useDebounce(emitTokenSelection, 300);

  const handleTokenClick = (symbol: string) => {
    // Only update the selected token if it's different
    if (symbol !== selectedToken) {
      setSelectedToken(symbol);
      
      // Find the token data to get the price
      const tokenData = tokens.find(token => token.symbol === symbol);
      if (tokenData) {
        // Dispatch a custom event that OrderForm can listen for
        try {
          // For OrderForm to update price
          const priceEvent = new CustomEvent('token-price-update', {
            detail: { 
              symbol: symbol,
              price: tokenData.price,
              change: tokenData.change24h
            }
          });
          window.dispatchEvent(priceEvent);
          
          // For TradingChart to update
          debouncedEmitTokenSelection(symbol);
        } catch (error) {
          console.error('TokenList: Error dispatching price update:', error);
        }
      }
    }
  };

  // Show more tokens
  const handleShowMore = () => {
    setNumTokens(prev => Math.min(prev + 5, activeTokens.length));
    updateDisplayTokens();
  };

  // Show fewer tokens
  const handleShowFewer = () => {
    setNumTokens(prev => Math.max(prev - 5, 5));
    updateDisplayTokens();
  };

  return (
    <div className="token-list">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Popular Assets</h3>
      
      <ul className="space-y-3">
        {displayTokens.map((token) => (
          <li
            key={token.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              token.symbol === selectedToken ? 'bg-gray-700' : 'hover:bg-gray-750'
            }`}
            onClick={() => handleTokenClick(token.symbol)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs bg-blue-600 mr-2`}>
                {token.symbol.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{token.name}</div>
                <div className="text-xs text-gray-400">{token.symbol}</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-white">${token.price < 1 ? token.price.toFixed(4) : token.price.toFixed(2)}</div>
              <div className={`text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {activeTokens.length > 5 && (
        <div className="flex justify-between mt-4">
          {numTokens > 5 && (
            <button
              onClick={handleShowFewer}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Show Less
            </button>
          )}
          {numTokens < activeTokens.length && (
            <button
              onClick={handleShowMore}
              className="text-xs text-blue-400 hover:text-blue-300 ml-auto"
            >
              Show More
            </button>
          )}
        </div>
      )}
    </div>
  );
} 