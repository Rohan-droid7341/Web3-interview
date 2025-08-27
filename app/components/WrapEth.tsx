'use client';

import { useState, useEffect } from 'react';
import { 
  useAccount, 
  useBalance, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
//   type WriteContractErrorType
} from 'wagmi';
import { parseEther, formatEther, BaseError } from 'viem';

// WETH Contract Details for Sepolia Testnet
const WETH_CONTRACT_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ea00A7896Cf';

const WETH_ABI = [
  { name: "balanceOf", type: "function", "stateMutability": "view", "inputs": [{"name": "owner", "type": "address"}], "outputs": [{"name": "", "type": "uint256"}] },
  { name: "deposit", type: "function", "stateMutability": "payable", "inputs": [], "outputs": [] }
] as const;

// function getFriendlyErrorMessage(error: WriteContractErrorType | null): string | null {
//   if (!error) return null;
//   if (error instanceof BaseError) {
//     if (error.shortMessage) return error.shortMessage;
//     const cause = error.cause as any;
//     if (cause?.code === 4001 || cause?.code === 'ACTION_REJECTED') {
//       return "Transaction rejected by user.";
//     }
//   }
//   return error.message;
// }

export function WrapEth() {
  const [amount, setAmount] = useState('');

  // --- DEBUGGING STEP 1: Check the core account connection ---
  const { address, isConnected, status } = useAccount();
  console.log('[DEBUG] Account Status:', { address, isConnected, status });

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();

  // --- DEBUGGING STEP 2: Check the ETH balance hook ---
  const { 
    data: ethBalance, 
    refetch: refetchEthBalance,
    isLoading: isEthBalanceLoading,
    isError: isEthBalanceError,
    error: ethBalanceError
  } = useBalance({ 
    address,
    // The query will not run until `address` is defined.
    query: { enabled: !!address }
  });
  console.log('[DEBUG] ETH Balance Hook:', { data: ethBalance, isLoading: isEthBalanceLoading, isError: isEthBalanceError, error: ethBalanceError });

  // --- DEBUGGING STEP 3: Check the WETH balance hook ---
  const { 
    data: wethBalance, 
    refetch: refetchWethBalance,
    isLoading: isWethBalanceLoading,
    isError: isWethBalanceError,
    error: wethBalanceError
  } = useReadContract({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: 'balanceOf',
    args: [address!], // The '!' is safe because of the `enabled` flag below
    query: { enabled: !!address }, // This is crucial: the hook will wait until `address` exists.
  });
  console.log('[DEBUG] WETH Balance Hook:', { data: wethBalance, isLoading: isWethBalanceLoading, isError: isWethBalanceError, error: wethBalanceError });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  async function handleWrap() {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    writeContract({
      address: WETH_CONTRACT_ADDRESS,
      abi: WETH_ABI,
      functionName: 'deposit',
      value: parseEther(amount),
    });
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchEthBalance();
      refetchWethBalance();
      setAmount('');
    }
  }, [isConfirmed, refetchEthBalance, refetchWethBalance]);

//   const friendlyWriteError = getFriendlyErrorMessage(writeError);    
  const isBalancesLoading = isEthBalanceLoading || isWethBalanceLoading;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
      
      {/* --- DEBUGGING UI: Display the raw connection status --- */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs font-mono">
        <h3 className="font-bold text-yellow-800 mb-1">Debug Info</h3>
        <div><strong>Status:</strong> {status}</div>
        <div><strong>Is Connected:</strong> {String(isConnected)}</div>
        <div><strong>Address:</strong> {address || 'Not available'}</div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Wrap Sepolia ETH</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between p-3 bg-gray-50 rounded-md">
          <span className="font-medium text-gray-600">Your ETH Balance:</span>
          <span className="font-mono text-gray-800">
            {isBalancesLoading ? 'Loading...' : ethBalance ? `${parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between p-3 bg-gray-50 rounded-md">
          <span className="font-medium text-gray-600">Your WETH Balance:</span>
          <span className="font-mono text-gray-800">
            {isBalancesLoading ? 'Loading...' : typeof wethBalance === 'bigint' ? `${parseFloat(formatEther(wethBalance)).toFixed(4)} WETH` : 'N/A'}
          </span>
        </div>
      </div>

      {/* --- DEBUGGING UI: Display balance loading errors --- */}
      {isEthBalanceError && <div className="mb-2 text-sm text-red-600">ETH Balance Error: {ethBalanceError?.message}</div>}
      {isWethBalanceError && <div className="mb-2 text-sm text-red-600">WETH Balance Error: {wethBalanceError?.message}</div>}

      <div className="space-y-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          aria-label="Amount to wrap"
        />
        <button
          onClick={handleWrap}
          disabled={!address || isPending || isConfirming}
          className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-md hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Check Wallet...' : isConfirming ? 'Wrapping...' : 'Wrap ETH'}
        </button>
      </div>
      
      {hash && <div className="mt-4 text-sm text-gray-600">Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{hash}</a></div>}
      {isConfirmed && <div className="mt-2 text-green-600 font-medium">Transaction successful! Balances updated.</div>}
      {/* {friendlyWriteError && <div className="mt-2 text-red-600">Error: {friendlyWriteError}</div>} */}
    </div>
  );
}