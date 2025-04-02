'use client';

// Mock user database for admin functionality
interface User {
  id: string;
  name?: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  walletBalance?: number;
  signupDate?: string;
}

// Default mock users if localStorage is empty
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    isLoggedIn: true,
    isAdmin: true,
    walletBalance: 50000,
    signupDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    isLoggedIn: false,
    walletBalance: 15000,
    signupDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    isLoggedIn: false,
    walletBalance: 7500,
    signupDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Check if localStorage is available (to avoid issues during SSR)
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Get all mock users
export const getAllUsers = (): User[] => {
  try {
    if (!isLocalStorageAvailable()) {
      console.log('localStorage not available, returning default users');
      return defaultUsers;
    }
    
    // In a real app, this would be an API call
    const storedUsers = localStorage.getItem('adminUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      console.log('Retrieved users from localStorage:', parsedUsers.length);
      return parsedUsers;
    }
    
    // If no users exist yet, create some mock users
    console.log('No users found in localStorage, initializing with default users');
    localStorage.setItem('adminUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (error) {
    console.error('Error getting users:', error);
    return defaultUsers;
  }
};

// Add a new user
export const addUser = (user: Omit<User, 'id'>): User => {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage not available');
    }
    
    const users = getAllUsers();
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    users.push(newUser);
    localStorage.setItem('adminUsers', JSON.stringify(users));
    return newUser;
  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error('Failed to add user');
  }
};

// Remove a user
export const removeUser = (userId: string): boolean => {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage not available');
    }
    
    const users = getAllUsers();
    const updatedUsers = users.filter(user => user.id !== userId);
    
    if (updatedUsers.length === users.length) {
      return false; // User not found
    }
    
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    return false;
  }
};

// Update a user
export const updateUser = (userId: string, userData: Partial<User>): User | null => {
  try {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage not available');
    }
    
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null; // User not found
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...userData
    };
    
    localStorage.setItem('adminUsers', JSON.stringify(users));
    return users[userIndex];
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Check if a user is an admin
export const isAdmin = (email: string): boolean => {
  try {
    if (!isLocalStorageAvailable()) {
      // Check against default admin email for SSR
      return email === 'admin@example.com';
    }
    
    const users = getAllUsers();
    const adminUser = users.find(user => user.email === email && user.isAdmin);
    return !!adminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 