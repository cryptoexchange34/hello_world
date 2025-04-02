'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { TokenProvider } from '@/context/TokenContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TokenProvider>
          {children}
        </TokenProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 