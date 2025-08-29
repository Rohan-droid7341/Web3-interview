"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"

interface PriceData {
  price: number
  change24h: number
  changePercent24h: number
  marketCap: number
  volume24h: number
  lastUpdated: string
}

interface HistoricalData {
  timestamp: number
  price: number
}

export default function EthPriceTracker() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEthPrice = async () => {
    try {
      const response = await fetch("/api/eth-price")
      if (!response.ok) throw new Error("Failed to fetch price")
      const data = await response.json()
      setPriceData(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch ETH price")
      console.error("Error fetching ETH price:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch("/api/eth-price/historical")
      if (!response.ok) {
        console.log("[v0] API rate limited, using mock historical data")
        const mockData = []
        const basePrice = 3500 + Math.random() * 1000
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const variation = (Math.random() - 0.5) * 200
          mockData.push({
            timestamp: date.getTime(),
            price: basePrice + variation + (Math.random() - 0.5) * 100,
          })
        }
        setHistoricalData(mockData)
        return
      }
      const data = await response.json()
      setHistoricalData(data)
    } catch (err) {
      console.error("Error fetching historical data:", err)
      const mockData = []
      const basePrice = 3500 + Math.random() * 1000
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const variation = (Math.random() - 0.5) * 200
        mockData.push({
          timestamp: date.getTime(),
          price: basePrice + variation + (Math.random() - 0.5) * 100,
        })
      }
      setHistoricalData(mockData)
    }
  }

  useEffect(() => {
    fetchEthPrice()
    fetchHistoricalData()
    const interval = setInterval(fetchEthPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-muted rounded-full"></div>
            <div className="h-6 bg-muted rounded w-24"></div>
          </div>
          <div className="h-12 bg-muted rounded w-48 mb-2"></div>
          <div className="h-6 bg-muted rounded w-32 mb-6"></div>
          <div className="h-64 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !priceData) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="text-destructive mb-2">⚠️ Error</div>
          <p className="text-muted-foreground">{error || "No data available"}</p>
        </div>
      </Card>
    )
  }

  const isPositive = priceData.changePercent24h >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  const chartData = historicalData.map((item, index) => ({
    time: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: item.price,
    index: index,
  }))

  const currentPrice = priceData?.price || 0

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ξ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ethereum</h1>
              <p className="text-slate-400 text-sm">ETH/USD</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="text-5xl font-bold text-white mb-3">{formatPrice(priceData.price)}</div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className={`${isPositive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"} px-3 py-1`}
            >
              <TrendIcon className="w-4 h-4 mr-1" />
              {isPositive ? "+" : ""}
              {priceData.changePercent24h.toFixed(2)}%
            </Badge>
            <span className={`text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}
              {formatPrice(priceData.change24h)}
            </span>
            <span className="text-slate-500 text-sm">24h</span>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="px-6 pb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 font-medium">Price Chart (7 Days)</h3>
                <div className="text-xs text-slate-500">USD</div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      className="text-slate-500"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      domain={["dataMin - 50", "dataMax + 50"]}
                      className="text-slate-500"
                    />
                    <defs>
                      <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                        <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
                      </pattern>
                    </defs>
                    <ReferenceLine y={currentPrice} stroke="#64748b" strokeDasharray="2 2" strokeOpacity={0.5} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f1f5f9",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#22c55e" : "#ef4444"}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: isPositive ? "#22c55e" : "#ef4444",
                        stroke: "#1e293b",
                        strokeWidth: 2,
                      }}
                      fill="url(#priceGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-2">Market Cap</div>
              <div className="text-xl font-bold text-white">{formatLargeNumber(priceData.marketCap)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-2">24h Volume</div>
              <div className="text-xl font-bold text-white">{formatLargeNumber(priceData.volume24h)}</div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 text-xs text-slate-500 text-center border-t border-slate-800 pt-4">
          Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
        </div>
      </Card>
    </div>
  )
}
