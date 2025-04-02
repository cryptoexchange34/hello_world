'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setAuth, clearAuth, getUser, isAuthenticated } from '@/utils/auth';
import { isAdmin as checkIsAdmin } from '@/utils/adminUtils';

interface User {
  name?: string;
  email: string;
  isLoggedIn: boolean;
  signupDate?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  checkSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user is logged in on initial load
  useEffect(() => {
    if (!isMounted) return;
    checkLoggedIn();
  }, [isMounted]);

  const checkLoggedIn = () => {
    try {
      if (isAuthenticated()) {
        const userData = getUser();
        
        // Check admin status
        if (userData) {
          console.log('Checking admin status for:', userData.email);
          const adminStatus = userData.isAdmin || checkIsAdmin(userData.email);
          setIsAdminUser(adminStatus);
          userData.isAdmin = adminStatus;
          setUser(userData);
          console.log('User authenticated with admin status:', adminStatus);
        }
      } else {
        // Clear any inconsistent state
        clearAuth();
        setUser(null);
        setIsAdminUser(false);
        console.log('User is not authenticated');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      clearAuth();
      setUser(null);
      setIsAdminUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Public method to check session
  const checkSession = () => {
    setIsLoading(true);
    checkLoggedIn();
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, you would validate credentials against your backend
      // For this demo, we'll simulate a successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user is admin
      const adminStatus = checkIsAdmin(email);
      console.log('Admin status check on login:', adminStatus);
      
      const userData: User = {
        email,
        isLoggedIn: true,
        isAdmin: adminStatus
      };
      
      // Use the utility function to set auth
      setAuth(userData);
      
      setUser(userData);
      setIsAdminUser(adminStatus);
      
      // Add a small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a reload to ensure the cookies take effect
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, you would create the user in your backend
      // For this demo, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        name,
        email,
        isLoggedIn: true,
        signupDate: new Date().toISOString(),
        isAdmin: false // New users are not admins by default
      };
      
      // Use the utility function to set auth
      setAuth(userData);
      
      // Initialize wallet balance for new users
      localStorage.setItem('walletBalance', '10000');
      
      setUser(userData);
      setIsAdminUser(false);
      
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    setUser(null);
    setIsAdminUser(false);
    
    // Force a reload to ensure the cookies are cleared
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
    isAdmin: isAdminUser,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 