'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TradingInterface from "../components/TradingInterfrace";
import ApproveWETH from "../components/ApproveWETH";
import EthPriceTracker from "../components/EthPriceTracker";
import TransactionHistory from "../components/TransactionHistory";
import { FiActivity, FiClock } from 'react-icons/fi'; 
import {usePrivy} from '@privy-io/react-auth';

type View = 'trading' | 'history';

export default function Trade() {
  const [activeView, setActiveView] = useState<View>('trading');
   const router = useRouter();
    const {
      ready,
      authenticated,
      user,
      logout,
    } = usePrivy();
  
    // Redirect to home if not authenticated
    useEffect(() => {
      if (ready && !authenticated) {
        router.push('/');
      }
    }, [ready, authenticated, router]);
  
    // A loading state while Privy is getting ready
    if (!ready) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
          <p>Loading...</p>
        </main>
      );
    }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="pb-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold">Paper Trading Terminal</h1>
          <p className="mt-1 text-gray-400">Approve, trade, and review your transaction history.</p>
        </div>

        {/* Navbar / Tab Navigation */}
        <div className="mt-8 flex items-center gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveView('trading')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors duration-200 ${
              activeView === 'trading'
                ? 'border-b-2 border-violet-400 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiActivity />
            <span>Trading Interface</span>
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors duration-200 ${
              activeView === 'history'
                ? 'border-b-2 border-violet-400 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiClock />
            <span>Transaction History</span>
          </button>
        </div>

        {/* Conditionally Rendered Content Area */}
        <div className="mt-5">

          {/* View 1: Trading Interface */}
          {activeView === 'trading' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 animate-fade-in">
              
              {/* Left Column: Graph */}
              <div className="lg:col-span-2 ">
                <EthPriceTracker />
              </div>

              {/* Right Column: Actions (stacked) */}
              <div className="flex flex-col">
                {/* Approve WETH Component */}
                <div >
                  <ApproveWETH />
                </div>
                {/* Trading Interface Component */}
                <div>
                  <TradingInterface />
                </div>
                

              </div>

            </div>
          )}

          {/* View 2: Transaction History */}
          {activeView === 'history' && (
            <div>
              <TransactionHistory />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}