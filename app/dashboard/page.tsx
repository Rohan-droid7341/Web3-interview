'use client';

import {usePrivy} from '@privy-io/react-auth';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const {ready, authenticated, user} = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && (
        <div className="mt-4 rounded-md bg-gray-600 p-4">
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          {user.wallet && (
            <p>
              <strong>Wallet Address:</strong> {user.wallet.address}
            </p>
          )}
        </div>
      )}
    </main>
  );
}