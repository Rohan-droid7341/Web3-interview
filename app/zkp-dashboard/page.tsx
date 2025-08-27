'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';

declare const snarkjs: any;

export default function ZkpDashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [verificationKey, setVerificationKey] = useState<object | null>(null);
  const [zkp, setZkp] = useState<{ proof: any; publicSignals: any } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // not a user -> go back 
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    async function loadVerificationKey() {
      try {
        const response = await fetch('/zkp/verification_key.json');
        const vkey = await response.json();
        setVerificationKey(vkey);
      } catch (error) {
        console.error('Failed to load verification key:', error);
      }
    }
    loadVerificationKey();
  }, []); 

  /**
   * Converts a string into a BigInt that can be used as a private input in a Circom circuit.
   */
  function stringToBigInt(s: string): bigint {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(s);
    let hex = '0x';
    encoded.forEach(byte => {
      hex += byte.toString(16).padStart(2, '0');
    });
    return BigInt(hex);
  }

  
  async function generateAndVerifyProof() {
    if (!user?.id || !isScriptLoaded || !verificationKey) {
      alert('ZK components are not loaded yet. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setResultMessage(null);
    setZkp(null);

    try {
      // 1. Generate the Proof
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { secret: stringToBigInt(user.id) },
        '/zkp/circuit.wasm',
        '/zkp/circuit_final.zkey'
      );
      setZkp({ proof, publicSignals }); 

      // 
      const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

      
      if (isValid) {
        setResultMessage('✅ Verification OK');
      } else {
        setResultMessage('❌ Invalid Proof');
      }

    } catch (error) {
      console.error('An error occurred during the ZKP process:', error);
      setResultMessage('An error occurred. See console for details.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (!ready || !authenticated) {
    return <p className="p-4">Loading user...</p>;
  }
  
  const isReady = isScriptLoaded && !!verificationKey;
  
  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/snarkjs@0.7.3/build/snarkjs.min.js" 
        onLoad={() => setIsScriptLoaded(true)}
      />

      <main className="flex min-h-screen flex-col items-center p-4 sm:p-12 bg-gray-100">
        <div className="w-full max-w-4xl space-y-8">
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Self-Contained ZKP Dashboard</h1>
            <button
              onClick={() => logout().then(() => router.push('/'))}
              className="text-sm bg-red-100 hover:bg-red-200 py-2 px-4 rounded-md text-red-700"
            >
              Logout
            </button>
          </div>

          {/* Section 1: The Components of ZKP */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">The 3 Components of our ZK Proof</h2>
            <p className="mt-2 text-gray-600">
              Zero-Knowledge Proofs involve three key pieces of data. Here, we generate a proof in the browser and then verify it immediately.
            </p>
            
            <div className="mt-4 space-y-4">
              {/* The Secret */}
              <div>
                <h3 className="font-semibold text-violet-700">1. The Secret (Private Input)</h3>
                <p className="text-sm text-gray-600">This is the private data that only you know. For this demo, it's your unique Privy DID. You will prove you know this without ever revealing it.</p>
                <pre className="mt-1 bg-violet-50 text-violet-900 font-mono p-2 text-xs rounded overflow-x-auto">{user.id}</pre>
              </div>
              {/* The Verification Key */}
              <div>
                <h3 className="font-semibold text-blue-700">2. The Verification Key (Public)</h3>
                <p className="text-sm text-gray-600">This is a public "lock" generated from our circuit. It is mathematically designed to be "unlocked" only by a valid proof for a corresponding secret.</p>
                <pre className="mt-1 h-32 bg-blue-50 text-blue-900 font-mono p-2 text-xs rounded overflow-auto">{verificationKey ? JSON.stringify(verificationKey, null, 2) : "Loading..."}</pre>
              </div>
              {/* The Proof */}
              <div>
                <h3 className="font-semibold text-green-700">3. The Proof (Generated & Public)</h3>
                <p className="text-sm text-gray-600">This is the cryptographic "key" you generate. It proves you have the secret that matches the public commitment (inside `publicSignals`), and it's structured to fit the "lock" (the Verification Key).</p>
              </div>
            </div>
          </div>

          {/* Section 2: The Action */}
          <div className="p-6 bg-white rounded-lg shadow-md text-center">
            <button
              onClick={generateAndVerifyProof}
              disabled={!isReady || isProcessing} 
              className="w-full sm:w-auto text-base bg-violet-600 hover:bg-violet-700 py-3 px-6 rounded-md text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : !isReady ? "Loading ZK Components..." : "Generate and Verify Proof"}
            </button>
          </div>

          {/* Section 3: The Results */}
          {zkp && (
            <div className="p-6 bg-white rounded-lg shadow-md animate-fade-in">
              <h2 className="text-xl font-semibold">Results</h2>
              
              {/* Display Proof */}
              <div>
                <h3 className="mt-4 font-semibold text-green-700">Generated Proof & Public Signals</h3>
                <p className="text-sm text-gray-600">This is the data that would normally be sent to a server or smart contract. Notice the `publicSignals` contains the public "hash" of your secret DID.</p>
                <pre className="mt-1 h-48 bg-green-50 text-green-900 font-mono p-2 text-xs rounded overflow-auto">{JSON.stringify(zkp, null, 2)}</pre>
              </div>
              
              {/* Display Verification Result */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700">Verification Result</h3>
                <div className={`mt-2 p-4 rounded-md text-lg text-center font-bold ${resultMessage?.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {resultMessage}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}