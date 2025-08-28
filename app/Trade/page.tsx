import TradingInterface from "../components/TradingInterfrace";
// import AdminPanel from "../components/AdminPanel";
import ApproveWETH from "../components/ApproveWETH";
// import Transfer from "../components/Transfer";
import EthPriceTracker from "../components/EthPriceTracker";
export default function Trade() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Paper Trading Interface</h1>
        {/* <AdminPanel /> */}    
        {/* <Transfer /> */}
        <ApproveWETH />
        <EthPriceTracker />
      <TradingInterface />
    </div>
  );
}