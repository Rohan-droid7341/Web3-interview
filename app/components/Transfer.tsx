'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, ERC20_ABI } from '../lib/contract';

export default function OwnershipManager() {
  const { address, isConnected } = useAccount();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: currentOwner } = useReadContract({
    address: CONTRACTS.TEST_USD,
    abi: ERC20_ABI,
    functionName: 'owner',
  });

  const isCurrentOwner = currentOwner && address && currentOwner.toLowerCase() === address.toLowerCase();
  const isAlreadyCorrectOwner = currentOwner && currentOwner.toLowerCase() === CONTRACTS.PAPER_TRADING.toLowerCase();

  const handleTransferOwnership = () => {
    writeContract({
      address: CONTRACTS.TEST_USD,
      abi: ERC20_ABI,
      functionName: 'transferOwnership',
      args: [CONTRACTS.PAPER_TRADING],
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Fix Ownership</h2>
        <p className="text-gray-500">Connect wallet to transfer ownership</p>
      </div>
    );
  }

  if (isAlreadyCorrectOwner) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Fix Ownership</h2>
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">✅ Ownership is already correct!</p>
          <p className="text-sm text-green-600 mt-1">Paper Trading contract owns TestUSD</p>
        </div>
      </div>
    );
  }

  if (!isCurrentOwner) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Fix Ownership</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">❌ You are not the TestUSD owner</p>
          <p className="text-sm text-red-600 mt-1">Current owner: {currentOwner}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Fix Ownership</h2>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">⚠️ TestUSD needs to be owned by Paper Trading contract</p>
        <p className="text-sm text-yellow-600 mt-1">This will fix the depositWETH function</p>
      </div>

      {isConfirmed ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">✅ Ownership transferred successfully!</p>
        </div>
      ) : (
        <button
          onClick={handleTransferOwnership}
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-lg font-medium"
        >
          {isPending ? 'Transferring...' : 'Transfer Ownership to Trading Contract'}
        </button>
      )}
    </div>
  );
}