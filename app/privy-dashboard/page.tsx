'use client';

import {usePrivy} from '@privy-io/react-auth';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [verifyResult] = useState<any>();
  const {
    ready,
    authenticated,
    user,
    logout,
    
  } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);



  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-20 bg-privy-light-blue">
      {ready && authenticated ? (
        <>
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-semibold">Privy Dashboard</h1>
            <button
              onClick={logout}
              className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
            >
              Logout
            </button>
          </div>
          

          {verifyResult && (
            <div className="mt-6">
              <p className="font-bold uppercase text-sm text-gray-600">
                Server Verify Result
              </p>
              <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
                {JSON.stringify(verifyResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6">
            <p className="font-bold uppercase text-sm text-gray-600">
              User Object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </>
      ) : null}
    </main>
  );
}