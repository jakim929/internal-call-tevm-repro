import { createContract, definePrecompile, defineCall, Hex } from 'tevm'

import { Address, hexToBytes } from 'viem'
import { IStoreAbi } from './IStoreAbi'

export const createStorePrecompile = ({ address }: { address: Address }) => {
  const contract = createContract({
    abi: IStoreAbi,
    address: address,
  })
  const testCall = async ({ data, gasLimit }: {data: Hex, gasLimit: bigint}) => {
    console.log('called testCall', data, gasLimit)
    return {
      returnValue: hexToBytes('0x'),
      executionGasUsed: 0n,
      logs: [],
    }
  }

  return definePrecompile({
    contract,
    call: testCall,
  })
}
