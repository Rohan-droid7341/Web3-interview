'use client';

import { useState, useEffect } from 'react';
import { 
  useAccount, 
  useBalance, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { FiDroplet, FiCheckCircle, FiExternalLink, FiLoader } from 'react-icons/fi';
import Image from 'next/image'; // Import the Next.js Image component

const WETH_CONTRACT_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';
const WETH_ABI = [
  { name: "balanceOf", type: "function", "stateMutability": "view", "inputs": [{"name": "owner", "type": "address"}], "outputs": [{"name": "", "type": "uint256"}] },
  { name: "deposit", type: "function", "stateMutability": "payable", "inputs": [], "outputs": [] }
] as const;



function BalanceDisplay({ label, value, isLoading, symbol, icon }: { label: string, value?: bigint, isLoading: boolean, symbol: string, icon: React.ReactNode }) {
  const displayValue = value !== undefined ? `${parseFloat(formatEther(value)).toFixed(4)}` : '0.000';
  
  return (
    <div className="bg-black/20 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-xl text-gray-400">{icon}</div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <FiLoader className="animate-spin text-lg text-white" />
            ) : (
              <p className="text-xl font-semibold text-white">{displayValue}</p>
            )}
            <span className="text-sm text-gray-500">{symbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function WrapEth() {
  const [amount, setAmount] = useState('');
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { data: ethBalance, refetch: refetchEthBalance, isLoading: isEthBalanceLoading } = useBalance({ address });
  const { data: wethBalance, refetch: refetchWethBalance, isLoading: isWethBalanceLoading } = useReadContract({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetchEthBalance();
      refetchWethBalance();
      setAmount('');
    }
  }, [isConfirmed, refetchEthBalance, refetchWethBalance]);

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

  const isProcessing = isPending || isConfirming;
  const isBalancesLoading = isEthBalanceLoading || isWethBalanceLoading;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto p-4">
      
      

      <div className="w-full lg:w-3/5 rounded-2xl bg-gray-800 bg-opacity-50 p-6 shadow-lg space-y-6">
        <h2 className="text-xl font-bold">Wrap ETH into WETH</h2>

        {/* Balance Displays */}
        <div className="space-y-3">
          <BalanceDisplay 
            label="Your ETH Balance" 
            value={ethBalance?.value}
            isLoading={isBalancesLoading}
            symbol="ETH"
            icon={<FiDroplet />}
          />
          <BalanceDisplay 
            label="Your WETH Balance" 
            value={wethBalance}
            isLoading={isBalancesLoading}
            symbol="WETH"
            icon={<div className="font-bold text-lg">W</div>}
          />
        </div>

        {/* Input and Action Area */}
        <div className="space-y-4 pt-4 border-t border-gray-700">
          <div>
            <label htmlFor="wrap-amount" className="block text-sm font-medium text-gray-400 mb-2">
              Amount to Wrap
            </label>
            <input
              id="wrap-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              disabled={isProcessing}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-violet-500 outline-none transition"
            />
          </div>
          <button
            onClick={handleWrap}
            disabled={!address || isProcessing || !amount}
            className="w-full flex items-center justify-center gap-3 text-lg bg-violet-600 hover:bg-violet-700 py-3 px-8 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing && <FiLoader className="animate-spin" />}
            <span>{isPending ? 'Check Wallet...' : isConfirming ? 'Wrapping...' : 'Wrap ETH'}</span>
          </button>
        </div>
        
        {/* Transaction Status Feedback */}
        {hash && (
          <div className="text-sm text-center text-gray-400">
            <p>Transaction Sent!</p>
            <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline break-all">
              View on Etherscan <FiExternalLink className="inline ml-1" />
            </a>
          </div>
        )}
        {isConfirmed && (
          <div className="flex items-center justify-center gap-2 font-medium text-green-400">
            <FiCheckCircle />
            <span>Transaction successful! Balances updated.</span>
          </div>
        )}
      </div>
      <div className="w-full lg:w-5/5">
        
        <Image 
          src="/faucet.jpg" 
          alt="Sepolia Faucet Guide"
          width={800}
          height={800}
          className="rounded-2xl shadow-lg object-cover"
          priority 
        />
      </div>
    </div>
  );
}