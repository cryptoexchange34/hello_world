'use client';

import Cookies from 'js-cookie';
import { getAllUsers } from './adminUtils';

interface User {
  name?: string;
  email: string;
  isLoggedIn: boolean;
  signupDate?: string;
  isAdmin?: boolean;
}

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Set authentication
export const setAuth = (user: User) => {
  if (!isBrowser) return;

  try {
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set auth cookie
    Cookies.set('auth_token', 'authenticated', { expires: 7, path: '/' });
    
    // Set additional cookies for middleware
    Cookies.set('isLoggedIn', 'true', { expires: 7, path: '/' });
    
    // Set admin cookie if user is admin
    if (user.isAdmin) {
      Cookies.set('isAdmin', 'true', { expires: 7, path: '/' });
    } else {
      Cookies.remove('isAdmin', { path: '/' });
    }
    
    // For debugging
    console.log('Auth set:', { user, cookie: Cookies.get('auth_token') });
  } catch (error) {
    console.error('Error setting auth:', error);
  }
};

// Clear authentication
export const clearAuth = () => {
  if (!isBrowser) return;

  try {
    // Remove from localStorage
    localStorage.removeItem('user');
    
    // Remove all auth cookies
    Cookies.remove('auth_token', { path: '/' });
    Cookies.remove('isLoggedIn', { path: '/' });
    Cookies.remove('isAdmin', { path: '/' });
    
    // For debugging
    console.log('Auth cleared');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

// Get user from localStorage
export const getUser = (): User | null => {
  if (!isBrowser) return null;

  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (!isBrowser) return false;
  return !!Cookies.get('auth_token') && !!getUser();
};

// Helper function for logging in as admin (for development)
export const loginAsAdmin = () => {
  console.log('Logging in as admin...');
  
  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    isLoggedIn: true,
    isAdmin: true,
    signupDate: new Date().toISOString()
  };
  
  // Use the utility function to set auth with cookies
  setAuth(adminUser);
  
  // Extra safety: Set admin cookie directly as well
  if (isBrowser) {
    Cookies.set('isAdmin', 'true', { expires: 7, path: '/' });
    Cookies.set('isLoggedIn', 'true', { expires: 7, path: '/' });
  }
  
  // Ensure admin exists in the admin users list
  try {
    if (isBrowser) {
      // Initialize admin users if needed
      const allUsers = getAllUsers();
      // This will add default users including admin if they don't exist
      console.log('Initialized admin users:', allUsers.length);
    }
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
  }
  
  return adminUser;
}; 