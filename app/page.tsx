'use client';

import {usePrivy} from '@privy-io/react-auth';
import {useRouter} from 'next/navigation';

// Using an icon for a better user experience
import {FiLogOut, FiArrowRight} from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const {ready, authenticated, user, login, logout} = usePrivy();

  // Show a loading state while the Privy SDK is initializing
  if (!ready) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
      {authenticated && user ? (
        
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-700">
            <div>
              <h1 className="text-3xl font-bold">Logged in through Privy</h1>
              <p className="text-gray-400">
                Now prove your identity with Zero-Knowledge Proofs! 
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-base font-semibold text-white transition hover:bg-gray-600"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>

          {/* User Information Card */}
          <div className="mt-8 rounded-2xl bg-gray-800 bg-opacity-50 p-8 shadow-lg backdrop-blur-lg">
            <h2 className="mb-6 text-xl font-semibold text-white">
              User Details
            </h2>
            <div className="space-y-4">
              {/* User ID */}
              <div>
                <p className="text-sm font-medium text-gray-400">User ID</p>
                <pre className="mt-1 max-w-full overflow-x-auto rounded-md bg-gray-900 p-3 font-mono text-sm text-gray-300">
                  {user.id}
                </pre>
              </div>
              {/* User Wallet Address */}
              {user.wallet && (
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Wallet Address
                  </p>
                  <pre className="mt-1 max-w-full overflow-x-auto rounded-md bg-gray-900 p-3 font-mono text-sm text-gray-300">
                    {user.wallet.address}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Navigation to ZKP Dashboard */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/zkp-dashboard')}
              className="flex items-center justify-center w-full max-w-xs mx-auto rounded-lg bg-violet-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-violet-700"
            >
              <span>ZKP Authorization</span>
              <FiArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      ) : (
        
        <div className="w-full max-w-md rounded-2xl bg-gray-800 bg-opacity-50 p-8 text-center shadow-lg backdrop-blur-lg">
          <h1 className="mb-4 text-4xl font-bold">
            Welcome to the Overwhelm
          </h1>
          <h2 className="mb-8 text-lg text-gray-400">
            First, securely log in using Privy.
          </h2>
          <button
            onClick={login}
            className="w-full rounded-lg bg-violet-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-violet-700"
          >
            Log In
          </button>
        </div>
      )}
    </main>
  );
}