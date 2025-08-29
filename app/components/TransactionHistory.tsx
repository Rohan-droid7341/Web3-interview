'use client';

import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import moment from 'moment';

const query = gql`{
  testUSDRedeemeds(first: 50, orderBy: blockTimestamp, orderDirection: desc) {
    id
    user
    testUSDAmount
    wethWithdrawn
    ethPrice
    blockNumber
    blockTimestamp
    transactionHash
  }
   
  wethdepositeds(first: 50, orderBy: blockTimestamp, orderDirection: desc) {
    id
    user
    wethAmount
    testUSDMinted
    ethPrice
    blockNumber
    blockTimestamp
    transactionHash
  }
}`;

const url = 'https://api.studio.thegraph.com/query/119732/paper-trading/version/latest';
const headers = { Authorization: 'Bearer ff1368ea2f8ccec75f6919f78188558d' };

interface Transaction {
  id: string;
  user: string;
  ethPrice: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface WethDeposited extends Transaction {
  wethAmount: string;
  testUSDMinted: string;
}

interface TestUSDRedeemed extends Transaction {
  testUSDAmount: string;
  wethWithdrawn: string;
}

interface QueryResult {
  testUSDRedeemeds: TestUSDRedeemed[];
  wethdepositeds: WethDeposited[];
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<QueryResult>({
    queryKey: ['dashboardData'],
    queryFn: async () => await request(url, query, {}, headers),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="text-xl text-red-500">Error loading data</div>
    </div>
  );

  const { wethdepositeds, testUSDRedeemeds } = data || { wethdepositeds: [], testUSDRedeemeds: [] };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-white">Transaction History</h1>

      <div className="space-y-12">
        {/* WETH Deposited Transactions */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">WETH Deposited</h2>
          {wethdepositeds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      WETH Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      TestUSD Minted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ETH Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {wethdepositeds.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-300">
                        <a 
                          href={`https://etherscan.io/tx/${tx.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {tx.transactionHash.substring(0, 6)}...{tx.transactionHash.substring(tx.transactionHash.length - 4)}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {tx.user.substring(0, 6)}...{tx.user.substring(tx.user.length - 4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{(parseFloat(tx.wethAmount)/1e18).toFixed(4)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{(parseFloat(tx.testUSDMinted)/1e6).toFixed(4)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${(parseFloat(tx.ethPrice)/1e6).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {moment.unix(parseInt(tx.blockTimestamp)).fromNow()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No WETH deposited transactions found.</p>
          )}
        </div>

        {/* TestUSD Redeemed Transactions */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-green-400">TestUSD Redeemed</h2>
          {testUSDRedeemeds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      TestUSD Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      WETH Withdrawn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ETH Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {testUSDRedeemeds.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-300">
                        <a 
                          href={`https://etherscan.io/tx/${tx.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {tx.transactionHash.substring(0, 6)}...{tx.transactionHash.substring(tx.transactionHash.length - 4)}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {tx.user.substring(0, 6)}...{tx.user.substring(tx.user.length - 4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{(parseFloat(tx.testUSDAmount)/1e6).toFixed(4)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{(parseFloat(tx.wethWithdrawn)/1e18).toFixed(4)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${(parseFloat(tx.ethPrice)/1e6).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {moment.unix(parseInt(tx.blockTimestamp)).fromNow()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No TestUSD redeemed transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}