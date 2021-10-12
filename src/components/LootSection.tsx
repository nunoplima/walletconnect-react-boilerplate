import React, {
  FC,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'
import { useWeb3Context } from '@contexts/useWeb3Context'
import Loot from '@/abis/Loot.json'
import { Status } from '@/types'

export const LootSection: FC = () => {
  const [lootContract, setLootContract] = useState<Contract | null>(null)
  const [lootBalance, setLootBalance] = useState(0)
  const { web3, account, status } = useWeb3Context()

  const loadLootContract = useCallback(async () => {
    if (web3) {
      const networdId = await web3.eth.net.getId()
      const networkData = Loot.networks[networdId]

      if (networkData) {
        const loot = new web3.eth.Contract(Loot.abi as AbiItem[], networkData.address)
        setLootContract(loot)
      } else {
        alert('Contract not deployed on the current network')
      }
    }
  }, [web3])

  const getLootBalance = useCallback(async () => {
    const address = '0x7a6a21ba4cb15ae3c40e0a567c0d01cd9ad4f72c'
    const balance = await lootContract?.methods.balanceOf(address).call()
    setLootBalance(balance)
  }, [lootContract?.methods])

  useEffect(() => {
    if (web3 && account) loadLootContract()
  }, [account, loadLootContract, web3])

  useEffect(() => {
    if (lootContract && account) getLootBalance()
  }, [account, lootContract, getLootBalance])

  if (status !== Status.connected) return null

  return (
    <p>Your account: {account} has {lootBalance} Loot(s)</p>
  )
}