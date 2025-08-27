// 'use client';
// import {useAccount} from 'wagmi';

// export default function WalletAddress(){
//   const {address} = useAccount();
//   return <p>Wallet address: {address}</p>;
// }


'use client';

import { useState, useEffect } from 'react';
import { 
  useAccount, 
  useBalance, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';

// WETH Contract Details for Sepolia Testnet
const WETH_CONTRACT_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';

const WETH_ABI = [
  { name: "balanceOf", type: "function", "stateMutability": "view", "inputs": [{"name": "owner", "type": "address"}], "outputs": [{"name": "", "type": "uint256"}] },
  { name: "deposit", type: "function", "stateMutability": "payable", "inputs": [], "outputs": [] }
] as const;


export default function WrapEth() {
  const [amount, setAmount] = useState('');

  // 1. Get connected account details
  const { address, isConnected, status } = useAccount();

  // 2. Hook to write to the WETH contract's 'deposit' function
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();

  // 3. Hooks to read ETH and WETH balances
  const { 
    data: ethBalance, 
    refetch: refetchEthBalance,
    isLoading: isEthBalanceLoading
  } = useBalance({ 
    address,
    query: { enabled: !!address } // Only runs if `address` is available
  });

  const { 
    data: wethBalance, 
    refetch: refetchWethBalance,
    isLoading: isWethBalanceLoading
  } = useReadContract({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });

  // 4. Hook to wait for the transaction to be confirmed
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // 5. Function to trigger the wrap transaction
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

  // 6. Effect to refetch balances after a successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchEthBalance();
      refetchWethBalance();
      setAmount(''); // Reset input field
    }
  }, [isConfirmed, refetchEthBalance, refetchWethBalance]);

  const isBalancesLoading = isEthBalanceLoading || isWethBalanceLoading;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
      {/* Optional: Debug Info Box to confirm wallet connection */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs font-mono">
        <h3 className="font-bold text-yellow-800 mb-1">Connection Status</h3>
        <div><strong>Address:</strong> {address || 'Not Connected'}</div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Wrap Sepolia ETH</h2>
      
      {/* Balances Display */}
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

      {/* Input and Action Button */}
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
      
      {/* Transaction Status and Simplified Error Display */}
      {hash && <div className="mt-4 text-sm text-gray-600">Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{hash}</a></div>}
      {isConfirmed && <div className="mt-2 text-green-600 font-medium">Transaction successful! Balances updated.</div>}
      {writeError && (
        <div className="mt-2 text-red-600">
          {/* Simple and safe way to display the error */}
          Error: {writeError.message.includes('User rejected the request') ? 'Transaction rejected by user.' : writeError.message}
        </div>
      )}
    </div>
  );
}