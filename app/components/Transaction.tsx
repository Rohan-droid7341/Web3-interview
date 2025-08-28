//this file is not used anywhere , its for backup only


import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import Data from './GraphData'

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
    
}`

const url = 'https://api.studio.thegraph.com/query/119732/paper-trading/version/latest'
const headers = { Authorization: 'Bearer ff1368ea2f8ccec75f6919f78188558d' }

export default async function HomePage() {
  const queryClient = new QueryClient()
  
  // Pre-fetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query, {}, headers)
    }
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Data />
    </HydrationBoundary>
  )
}