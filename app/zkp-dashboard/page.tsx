'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { FiLock, FiKey, FiCpu, FiCheckCircle, FiXCircle, FiLoader, FiLogOut, FiArrowRight } from 'react-icons/fi';


interface ZkpResult {
  proof: unknown;           
  publicSignals: unknown;
}

declare const snarkjs: {
  groth16: {
    fullProve: (
      inputs: Record<string, unknown>,
      wasmPath: string,
      zkeyPath: string
    ) => Promise<ZkpResult>;
    verify: (
      vKey: object,
      publicSignals: unknown,
      proof: unknown
    ) => Promise<boolean>;
  };
};




export default function ZkpDashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [verificationKey, setVerificationKey] = useState<object | null>(null);
  const [zkp, setZkp] = useState<ZkpResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

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
      alert('ZK components are not loaded yet. Please wait and try again.');
      return;
    }

    setIsProcessing(true);
    setResultMessage(null);
    setZkp(null);

    try {
      // Generate the proof using snarkjs
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { secret: stringToBigInt(user.id) },
        '/zkp/circuit.wasm',
        '/zkp/circuit_final.zkey'
      );
      setZkp({ proof, publicSignals });

      // Verify the proof
      const isValid = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

      if (isValid) {
        setResultMessage('Verification Successful');
      } else {
        setResultMessage('Verification Failed: Invalid Proof');
      }

    } catch (error) {
      console.error('An error occurred during the ZKP process:', error);
      setResultMessage('An error occurred. See console for details.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (!ready || !authenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <FiLoader className="animate-spin text-4xl" />
        <p className="mt-4">Loading User...</p>
      </main>
    );
  }

  const isZkReady = isScriptLoaded && !!verificationKey;
  const isVerificationSuccessful = resultMessage === 'Verification Successful';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/snarkjs@0.7.3/build/snarkjs.min.js"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-12 text-white">
        <div className="w-full max-w-5xl space-y-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-700">
            <div>
              <h1 className="text-3xl font-bold">Self-Contained ZKP Dashboard</h1>
              <p className="mt-1 text-gray-400">Generate and verify a Zero-Knowledge Proof entirely in your browser.</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-base font-semibold transition hover:bg-gray-600 mt-4 sm:mt-0"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>

          {/* ZKP Components Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: The Secret */}
            <div className="rounded-2xl bg-gray-800 bg-opacity-50 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <FiLock className="text-violet-400 text-2xl" />
                <h3 className="font-semibold text-lg">1. The Secret (Private)</h3>
              </div>
              <p className="mt-2 text-sm text-gray-400">Your unique Privy DID, which you will prove ownership of without revealing it.</p>
              <pre className="mt-4 bg-gray-900 text-violet-300 font-mono p-3 text-xs rounded-md overflow-x-auto">{user?.id}</pre>
            </div>

            {/* Card 2: The Verification Key */}
            <div className="rounded-2xl bg-gray-800 bg-opacity-50 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <FiKey className="text-blue-400 text-2xl" />
                <h3 className="font-semibold text-lg">2. The Verification Key</h3>
              </div>
              <p className="mt-2 text-sm text-gray-400">A public key used to verify that your generated proof is valid.</p>
              <div className="mt-4 h-20 bg-gray-900 text-blue-300 font-mono p-3 text-xs rounded-md overflow-hidden flex items-center justify-center">
                {verificationKey ? "Verification Key Loaded" : <FiLoader className="animate-spin" />}
              </div>
            </div>

            {/* Card 3: The Proof */}
            <div className="rounded-2xl bg-gray-800 bg-opacity-50 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <FiCpu className="text-green-400 text-2xl" />
                <h3 className="font-semibold text-lg">3. The Proof (Generated)</h3>
              </div>
              <p className="mt-2 text-sm text-gray-400">The cryptographic proof you generate that attests to your knowledge of the secret.</p>
              <div className="mt-4 h-20 bg-gray-900 text-green-300 font-mono p-3 text-xs rounded-md flex items-center justify-center">
                {zkp ? "Proof Generated" : "Awaiting Generation..."}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={generateAndVerifyProof}
              disabled={!isZkReady || isProcessing}
              className="flex items-center justify-center gap-3 w-full sm:w-auto text-lg bg-violet-600 hover:bg-violet-700 py-3 px-8 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-all mx-auto"
            >
              {isProcessing && <FiLoader className="animate-spin" />}
              <span>
                {isProcessing ? "Processing..." : !isZkReady ? "Loading ZK Components..." : "Generate and Verify Proof"}
              </span>
            </button>
          </div>

          {/* Results Section */}
          {resultMessage && (
            <div className="rounded-2xl bg-gray-800 bg-opacity-50 p-6 shadow-lg animate-fade-in space-y-6">
              <h2 className="text-xl font-semibold">Results</h2>
              {/* Verification Result Banner */}
              <div className={`flex items-center gap-4 p-4 rounded-lg text-lg font-bold ${isVerificationSuccessful ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {isVerificationSuccessful ? <FiCheckCircle className="text-2xl" /> : <FiXCircle className="text-2xl" />}
                {resultMessage}
              </div>

              {/* Generated Proof Data */}
              {zkp && (
                <div>
                  <h3 className="font-semibold text-gray-300">Generated Proof & Public Signals</h3>
                  <p className="mt-1 text-sm text-gray-400">This data can now be sent to a server or smart contract for verification.</p>
                  <pre className="mt-3 h-48 bg-gray-900 text-gray-300 font-mono p-3 text-xs rounded-md overflow-auto">{JSON.stringify(zkp, null, 2)}</pre>
                </div>
              )}

              {/* === NEW: Button to proceed to Trading App === */}
              {isVerificationSuccessful && (
                <div className="pt-6 border-t border-gray-700 text-center">
                  <p className="text-gray-400 mb-4">Your identity has been verified. You can now proceed.</p>
                  <button
                    onClick={() => router.push('/Trade')}
                    className="flex items-center justify-center gap-3 w-full sm:w-auto text-lg bg-green-600 hover:bg-green-700 py-3 px-8 rounded-lg font-semibold transition-all mx-auto"
                  >
                    <span>Go to Trading App</span>
                    <FiArrowRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}