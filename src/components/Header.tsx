'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              CryptoTrader
            </Link>
            
            <nav className="hidden md:block ml-8">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/market" className="text-gray-300 hover:text-white">
                    Market
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="text-gray-300 hover:text-white">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link href="/trade" className="text-gray-300 hover:text-white">
                    Trade
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link 
                      href="/admin" 
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{user.name || user.email.split('@')[0]}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-blue-400 hover:bg-gray-600 hover:text-blue-300"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link href="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 