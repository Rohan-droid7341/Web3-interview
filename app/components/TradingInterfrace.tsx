'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, PAPER_TRADING_ABI, ERC20_ABI } from '../lib/contract';
import { formatWETH, formatTestUSD, parseWETH, parseTestUSD, formatPrice, formatPnL } from '../lib/utils';

export default function TradingInterface() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'redeem'>('deposit');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: ethPrice, refetch: refetchPrice } = useReadContract({
    address: CONTRACTS.PAPER_TRADING,
    abi: PAPER_TRADING_ABI,
    functionName: 'getLatestETHPrice',
  });

  const { data: wethBalance, refetch: refetchWethBalance } = useReadContract({
    address: CONTRACTS.WETH,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: testUSDBalance, refetch: refetchTestUSDBalance } = useReadContract({
    address: CONTRACTS.TEST_USD,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: userPnL, refetch: refetchPnL } = useReadContract({
    address: CONTRACTS.PAPER_TRADING,
    abi: PAPER_TRADING_ABI,
    functionName: 'getUserPnL',
    args: address ? [address] : undefined,
  });

  const { data: userDeposits, refetch: refetchDeposits } = useReadContract({
    address: CONTRACTS.PAPER_TRADING,
    abi: PAPER_TRADING_ABI,
    functionName: 'userWETHDeposits',
    args: address ? [address] : undefined,
  });

  const { data: redeemableWETH, refetch: refetchRedeemable } = useReadContract({
    address: CONTRACTS.PAPER_TRADING,
    abi: PAPER_TRADING_ABI,
    functionName: 'getRedeemableWETH',
    args: address ? [address] : undefined,
  });

  const { data: wethAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.WETH,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.PAPER_TRADING] : undefined,
  });

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        refetchPrice();
        refetchWethBalance();
        refetchTestUSDBalance();
        refetchPnL();
        refetchDeposits();
        refetchRedeemable();
        refetchAllowance();
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, [isConnected, refetchPrice, refetchWethBalance, refetchTestUSDBalance, refetchPnL, refetchDeposits, refetchRedeemable, refetchAllowance]);

  
  useEffect(() => {
    if (isConfirmed) {
      refetchWethBalance();
      refetchTestUSDBalance();
      refetchPnL();
      refetchDeposits();
      refetchRedeemable();
      refetchAllowance();
      setDepositAmount('');
      setRedeemAmount('');
    }
  }, [isConfirmed, refetchWethBalance, refetchTestUSDBalance, refetchPnL, refetchDeposits, refetchRedeemable, refetchAllowance]);

  const handleApprove = async () => {
    if (!depositAmount) return;
    
    writeContract({
      address: CONTRACTS.WETH,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.PAPER_TRADING, parseWETH(depositAmount)],
    });
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    writeContract({
      address: CONTRACTS.PAPER_TRADING,
      abi: PAPER_TRADING_ABI,
      functionName: 'depositWETH',
      args: [parseWETH(depositAmount)],
    });
  };

  const handleRedeem = async () => {
    if (!redeemAmount) return;
    
    writeContract({
      address: CONTRACTS.PAPER_TRADING,
      abi: PAPER_TRADING_ABI,
      functionName: 'redeemTestUSD',
      args: [parseTestUSD(redeemAmount)],
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-xl text-gray-500">Please connect your wallet to start trading</p>
      </div>
    );
  }

  const pnlData = userPnL ? formatPnL(userPnL) : null;
  const needsApproval = wethAllowance && depositAmount ? wethAllowance < parseWETH(depositAmount) : false;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      {/* Price Display */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Feed ETH Price</h2>
        <div className="text-4xl font-bold text-blue-600">
          {ethPrice ? formatPrice(ethPrice) : 'Loading...'}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="rounded-lg bg-white">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">WETH Balance</h3>
          <p className="text-2xl font-bold text-gray-900">
            {wethBalance ? formatWETH(wethBalance) : '0.00'}
          </p>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">TestUSD Balance</h3>
          <p className="text-2xl font-bold text-gray-900">
            {testUSDBalance ? formatTestUSD(testUSDBalance) : '0.00'}
          </p>
        </div>
        
        {/* <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Deposited</h3>
          <p className="text-2xl font-bold text-gray-900">
            {userDeposits ? formatWETH(userDeposits) : '0.00'} WETH
          </p>
        </div> */}
        
        <div className=" p-4">
          <h3 className="text-sm font-medium text-gray-500">P&L</h3>
          <p className={`text-2xl font-bold ${pnlData?.isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {pnlData ? `${pnlData.isProfit ? '+' : '-'}${pnlData.formatted} WETH` : '0.00 WETH'}
          </p>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === 'deposit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Deposit WETH
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === 'redeem'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Redeem TestUSD
          </button>
        </div>

        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WETH Amount
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.001"
              />
              {ethPrice && depositAmount && (
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {formatTestUSD(parseWETH(depositAmount) * ethPrice / BigInt(10 ** 18))} TestUSD
                </p>
              )}
            </div>
            
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={!depositAmount || isPending}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Approving...' : 'Approve WETH'}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || isPending}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Depositing...' : 'Deposit WETH'}
              </button>
            )}
          </div>
        )}

        {activeTab === 'redeem' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TestUSD Amount
              </label>
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
              {ethPrice && redeemAmount && (
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {formatWETH(parseTestUSD(redeemAmount) * BigInt(10 ** 18) / ethPrice)} WETH
                </p>
              )}
              {redeemableWETH && (
                <p className="text-sm text-blue-600 mt-1">
                  Max redeemable: {formatWETH(redeemableWETH)} WETH
                </p>
              )}
            </div>
            
            <button
              onClick={handleRedeem}
              disabled={!redeemAmount || isPending}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Redeeming...' : 'Redeem TestUSD'}
            </button>
          </div>
        )}

        {/* Transaction Status */}
        {isPending && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">Transaction pending...</p>
          </div>
        )}
        
        {isConfirming && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">Waiting for confirmation...</p>
          </div>
        )}
        
        {isConfirmed && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">Transaction confirmed!</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">Error: {error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}