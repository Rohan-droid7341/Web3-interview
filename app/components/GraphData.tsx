//this file is not used anywhere , its for backup only

'use client'
import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'

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

export default function Data() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query, {}, headers)
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}