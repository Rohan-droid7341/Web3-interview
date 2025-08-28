import { formatUnits, parseUnits } from 'viem';

export function formatWETH(value: bigint): string {
  return formatUnits(value, 18);
}

export function formatTestUSD(value: bigint): string {
  return formatUnits(value, 6);
}

export function parseWETH(value: string): bigint {
  return parseUnits(value, 18);
}

export function parseTestUSD(value: string): bigint {
  return parseUnits(value, 6);
}

export function formatPrice(priceInTestUSD: bigint): string {
  const price = formatUnits(priceInTestUSD, 6);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));
}


export function formatPnL(pnl: bigint): { formatted: string; isProfit: boolean } {
  // FIX: Replaced `0n` with `BigInt(0)` for broader compatibility.
  const isProfit = pnl >= BigInt(0);
  
  // Get the absolute value of the PnL before formatting.
  const absolutePnL = pnl < BigInt(0) ? -pnl : pnl;
  
  // Format the absolute value.
  const formatted = formatWETH(absolutePnL);
  
  return { formatted, isProfit };
}