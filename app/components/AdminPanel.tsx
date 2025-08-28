'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, ERC20_ABI } from '../lib/contract';
import { formatTestUSD, parseTestUSD } from '../lib/utils';
import { isAddress } from 'viem';

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [mintAmount, setMintAmount] = useState('');
  const [mintToAddress, setMintToAddress] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [burnFromAddress, setBurnFromAddress] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: owner } = useReadContract({
    address: CONTRACTS.TEST_USD,
    abi: ERC20_ABI,
    functionName: 'owner',
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACTS.TEST_USD,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
  });

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  useEffect(() => {
    if (address && !mintToAddress) {
      setMintToAddress(address);
    }
  }, [address, mintToAddress]);

  useEffect(() => {
    if (isConfirmed) {
      refetchTotalSupply();
      setMintAmount('');
      setBurnAmount('');
      setBurnFromAddress('');
    }
  }, [isConfirmed, refetchTotalSupply]);

  const handleMint = async () => {
    if (!mintAmount || !mintToAddress || !isAddress(mintToAddress)) return;
    
    writeContract({
      address: CONTRACTS.TEST_USD,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [mintToAddress as `0x${string}`, parseTestUSD(mintAmount)],
    });
  };

  const handleBurn = async () => {
    if (!burnAmount || !burnFromAddress || !isAddress(burnFromAddress)) return;
    
    writeContract({
      address: CONTRACTS.TEST_USD,
      abi: ERC20_ABI,
      functionName: 'burn',
      args: [burnFromAddress as `0x${string}`, parseTestUSD(burnAmount)],
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h2>
        <p className="text-gray-500">Please connect your wallet to access admin functions</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Access Denied: You are not the owner of the TestUSD contract</p>
          <p className="text-sm text-red-600 mt-1">
            Contract Owner: {owner || 'Loading...'}
          </p>
          <p className="text-sm text-red-600">
            Your Address: {address}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">TestUSD Admin Panel</h2>
      
      {/* Contract Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Contract Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-600">Total Supply:</span>
            <span className="ml-2 font-mono">
              {totalSupply ? formatTestUSD(totalSupply) : '0.00'} TestUSD
            </span>
          </div>
          <div>
            <span className="text-blue-600">Contract Owner:</span>
            <span className="ml-2 font-mono text-xs">
              {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mint Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-700">Mint TestUSD</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={mintToAddress}
              onChange={(e) => setMintToAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0x..."
            />
            <div className="mt-1 flex space-x-2">
              <button
                onClick={() => setMintToAddress(address || '')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Use My Address
              </button>
              <button
                onClick={() => setMintToAddress(CONTRACTS.PAPER_TRADING)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Use Trading Contract
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Mint
            </label>
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="1000.00"
              step="0.01"
            />
            <div className="mt-1 flex space-x-2">
              <button
                onClick={() => setMintAmount('1000')}
                className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
              >
                1,000
              </button>
              <button
                onClick={() => setMintAmount('10000')}
                className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
              >
                10,000
              </button>
              <button
                onClick={() => setMintAmount('100000')}
                className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
              >
                100,000
              </button>
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={!mintAmount || !mintToAddress || !isAddress(mintToAddress) || isPending}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Minting...' : 'Mint TestUSD'}
          </button>
        </div>

        {/* Burn Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-700">Burn TestUSD</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Address
            </label>
            <input
              type="text"
              value={burnFromAddress}
              onChange={(e) => setBurnFromAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0x..."
            />
            <div className="mt-1 flex space-x-2">
              <button
                onClick={() => setBurnFromAddress(address || '')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Use My Address
              </button>
              <button
                onClick={() => setBurnFromAddress(CONTRACTS.PAPER_TRADING)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Use Trading Contract
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Burn
            </label>
            <input
              type="number"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="1000.00"
              step="0.01"
            />
          </div>

          <button
            onClick={handleBurn}
            disabled={!burnAmount || !burnFromAddress || !isAddress(burnFromAddress) || isPending}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Burning...' : 'Burn TestUSD'}
          </button>
        </div>
      </div>

      {/* Transaction Status */}
      {isPending && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">Transaction pending...</p>
        </div>
      )}
      
      {isConfirming && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">Waiting for confirmation...</p>
        </div>
      )}
      
      {isConfirmed && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">Transaction confirmed! TestUSD supply updated.</p>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      )}

      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Only the contract owner can mint/burn TestUSD tokens</li>
          <li>• Minting increases the total supply of TestUSD</li>
          <li>• Burning decreases the total supply of TestUSD</li>
          <li>• Be careful when burning from addresses - ensure they have sufficient balance</li>
        </ul>
      </div>
    </div>
  );
}