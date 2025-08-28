import {
  OwnershipTransferred as OwnershipTransferredEvent,
  TestUSDRedeemed as TestUSDRedeemedEvent,
  WETHDeposited as WETHDepositedEvent
} from "../generated/PaperTrading_sol/PaperTrading_sol"
import {
  OwnershipTransferred,
  TestUSDRedeemed,
  WETHDeposited
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTestUSDRedeemed(event: TestUSDRedeemedEvent): void {
  let entity = new TestUSDRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.testUSDAmount = event.params.testUSDAmount
  entity.wethWithdrawn = event.params.wethWithdrawn
  entity.ethPrice = event.params.ethPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWETHDeposited(event: WETHDepositedEvent): void {
  let entity = new WETHDeposited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.wethAmount = event.params.wethAmount
  entity.testUSDMinted = event.params.testUSDMinted
  entity.ethPrice = event.params.ethPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
