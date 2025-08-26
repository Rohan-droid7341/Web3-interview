'use client';

import {usePrivy} from '@privy-io/react-auth';
import Link from 'next/link';

export default function Home() {
  const {ready, authenticated, login, logout} = usePrivy();

  if (!ready) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {authenticated ? (
        <div>
          <button
            onClick={logout}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
          >
            Log Out
          </button>
          <Link href="/dashboard">
            <button className="ml-4 rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-800">
              Go to Dashboard
            </button>
          </Link>
        </div>
      ) : (
        <>
        <h1 className="mb-4 text-2xl font-bold">Welcome to the Overwhelm</h1>
        <h2 className="mb-8 text-lg text-gray-400">First login using privy</h2>
        <button
          onClick={login}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
        >
          Log In
        </button>
        </>
      )}
    </main>
  );
}