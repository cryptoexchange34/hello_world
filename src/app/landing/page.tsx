'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Real-time Crypto Trading <span className="text-blue-500">Panel</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Experience cryptocurrency trading with live price updates, interactive charts, and a 
                seamless trading interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium text-center hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
                <Link 
                  href="/login" 
                  className="px-6 py-3 bg-gray-700 text-white rounded-md font-medium text-center hover:bg-gray-600 transition"
                >
                  Log In
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-xl">
                <div className="aspect-video bg-gray-700 rounded mb-4">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                      </div>
                      <div className="text-gray-400">Live Trading Chart Preview</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">BTC/USDT</span>
                      <span className="text-green-500">+2.41%</span>
                    </div>
                    <div className="text-white font-bold">$40,293.25</div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">ETH/USDT</span>
                      <span className="text-red-500">-0.82%</span>
                    </div>
                    <div className="text-white font-bold">$2,475.18</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real-Time Updates</h3>
              <p className="text-gray-400">Get live price updates and trading signals for major cryptocurrencies.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Advanced Charts</h3>
              <p className="text-gray-400">Interactive trading charts with customizable indicators and timeframes.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Portfolio Tracking</h3>
              <p className="text-gray-400">Monitor your investments and trading performance in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Start Trading?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Create an account today and experience the power of real-time crypto trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium text-center hover:bg-blue-700 transition"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 bg-gray-700 text-white rounded-md font-medium text-center hover:bg-gray-600 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 