"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";

// --- WETH ABI (only approve function) ---
const WETH_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

// --- Replace with your deployed addresses ---
const WETH_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // Sepolia WETH
const TRADING_CONTRACT = "0xfac3af0be0ec503ec148b43ecffe8f1591180d0d"; // replace with yours

export default function ApproveWETH() {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [amount, setAmount] = useState("");

  const handleApprove = async () => {
    if (!amount) return alert("Enter amount first!");

    try {
      await writeContract({
        address: WETH_ADDRESS,
        abi: WETH_ABI,
        functionName: "approve",
        args: [TRADING_CONTRACT, parseEther(amount)],
      });
    } catch (err) {
      console.error(err);
      alert("Approval failed! Check console for details.");
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-md bg-gray-900 text-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Approve WETH</h2>
      <p className="mb-2 text-sm">Your wallet: {address || "Not connected"}</p>

      <input
        type="number"
        placeholder="Enter amount (WETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 mb-4 rounded-lg text-white"
      />

      <button
        onClick={handleApprove}
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full"
      >
        {isPending ? "Approving..." : "Approve Trading Contract"}
      </button>
    </div>
  );
}
