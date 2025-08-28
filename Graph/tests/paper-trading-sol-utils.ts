import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  TestUSDRedeemed,
  WETHDeposited
} from "../generated/PaperTrading_sol/PaperTrading_sol"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTestUSDRedeemedEvent(
  user: Address,
  testUSDAmount: BigInt,
  wethWithdrawn: BigInt,
  ethPrice: BigInt
): TestUSDRedeemed {
  let testUsdRedeemedEvent = changetype<TestUSDRedeemed>(newMockEvent())

  testUsdRedeemedEvent.parameters = new Array()

  testUsdRedeemedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  testUsdRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "testUSDAmount",
      ethereum.Value.fromUnsignedBigInt(testUSDAmount)
    )
  )
  testUsdRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "wethWithdrawn",
      ethereum.Value.fromUnsignedBigInt(wethWithdrawn)
    )
  )
  testUsdRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "ethPrice",
      ethereum.Value.fromUnsignedBigInt(ethPrice)
    )
  )

  return testUsdRedeemedEvent
}

export function createWETHDepositedEvent(
  user: Address,
  wethAmount: BigInt,
  testUSDMinted: BigInt,
  ethPrice: BigInt
): WETHDeposited {
  let wethDepositedEvent = changetype<WETHDeposited>(newMockEvent())

  wethDepositedEvent.parameters = new Array()

  wethDepositedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  wethDepositedEvent.parameters.push(
    new ethereum.EventParam(
      "wethAmount",
      ethereum.Value.fromUnsignedBigInt(wethAmount)
    )
  )
  wethDepositedEvent.parameters.push(
    new ethereum.EventParam(
      "testUSDMinted",
      ethereum.Value.fromUnsignedBigInt(testUSDMinted)
    )
  )
  wethDepositedEvent.parameters.push(
    new ethereum.EventParam(
      "ethPrice",
      ethereum.Value.fromUnsignedBigInt(ethPrice)
    )
  )

  return wethDepositedEvent
}
