'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  active: boolean;
  createdAt: string;
}

interface TokenContextType {
  tokens: Token[];
  activeTokens: Token[];
  loading: boolean;
  getToken: (symbol: string) => Token | undefined;
  updateTokenPrice: (symbol: string, newPrice: number, newChange24h?: number) => void;
  refreshTokens: () => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTokens = () => {
    setLoading(true);
    const storedTokens = localStorage.getItem('customTokens');
    
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
    } else {
      // Default tokens if none exist
      const defaultTokens: Token[] = [
        {
          id: '1',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 40293.25,
          change24h: 2.41,
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2475.18,
          change24h: -0.82,
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          symbol: 'SOL',
          name: 'Solana',
          price: 113.82,
          change24h: 5.67,
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          symbol: 'BNB',
          name: 'Binance Coin',
          price: 437.65,
          change24h: 1.23,
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          symbol: 'XRP',
          name: 'Ripple',
          price: 0.54,
          change24h: -1.47,
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      setTokens(defaultTokens);
      localStorage.setItem('customTokens', JSON.stringify(defaultTokens));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    refreshTokens();
    
    // Subscribe to storage events to update tokens when changed from another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customTokens') {
        refreshTokens();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get only active tokens
  const activeTokens = tokens.filter(token => token.active);

  // Get a specific token by symbol
  const getToken = (symbol: string): Token | undefined => {
    return tokens.find(token => token.symbol.toUpperCase() === symbol.toUpperCase());
  };

  // Update token price (for simulation purposes)
  const updateTokenPrice = (symbol: string, newPrice: number, newChange24h?: number) => {
    const updatedTokens = tokens.map(token => 
      token.symbol.toUpperCase() === symbol.toUpperCase()
        ? { 
            ...token, 
            price: newPrice,
            change24h: newChange24h !== undefined ? newChange24h : token.change24h
          }
        : token
    );
    
    setTokens(updatedTokens);
    localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
  };

  return (
    <TokenContext.Provider value={{ 
      tokens, 
      activeTokens,
      loading, 
      getToken, 
      updateTokenPrice,
      refreshTokens
    }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
} 