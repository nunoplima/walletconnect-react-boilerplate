import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'
import { provider as Provider } from 'web3-core'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { useIsMounted } from '@/hooks/useIsMounted'
import Loot from '@/abis/Loot.json'

const provider = new WalletConnectProvider({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
    5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  },
})

const App = () => {
  const isMounted = useIsMounted()
  const [account, setAccount] = useState<string | null>(null)
  const [lootContract, setLootContract] = useState<Contract | null>(null)
  const [lootBalance, setLootBalance] = useState(0)
  const [cashedWalletConnectProvider] = useLocalStorage('walletconnect')

  const events = useMemo(() => (
    [
      {
        name: 'accountsChanged',
        callback: (accounts) => setAccount(accounts[0]),
      },
      {
        name: 'disconnect',
        callback: (_code, _reason) => setAccount(null),
      },
    ]
  ), [])

  const addEventListeners = useCallback(() => {
    events.forEach(({ name, callback }) => provider.on(name, callback))
  }, [events])

  const removeEventListeners = useCallback(() => {
    events.forEach(({ name, callback }) => provider.off(name, callback))
  }, [events])

  const loadProvider = useCallback(async () => await provider.enable(), [])

  const loadAccount = useCallback(async () => {
    const web3 = new Web3(provider as unknown as Provider)
    const [account] = await web3.eth.getAccounts()
    setAccount(account)
  }, [])

  const loadLootContract = useCallback(async () => {
    const web3 = new Web3(provider as unknown as Provider)
    const networdId = await web3.eth.net.getId()

    if (networdId === 1) {
      const lootContractAddress = '0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7'
      const loot = new web3.eth.Contract(Loot.abi as AbiItem[], lootContractAddress)
      setLootContract(loot)
    } else {
      alert('Contract not deployed on the current network')
    }
  }, [])

  const connect = useCallback(async () => {
    loadProvider()
    loadAccount()
    addEventListeners()
    loadLootContract()
  }, [
    addEventListeners,
    loadAccount,
    loadLootContract,
    loadProvider,
  ])

  const getLootBalance = useCallback(async () => {
    const balance = await lootContract?.methods.balanceOf(account).call()
    setLootBalance(balance)
  }, [account, lootContract?.methods])

  useEffect(() => {
    if (!isMounted && cashedWalletConnectProvider.connected) {
      (async () => {
        await connect()
      })()
    }
  }, [
    cashedWalletConnectProvider,
    connect,
    isMounted,
    addEventListeners,
  ])

  useEffect(() => {
    if (lootContract && account) getLootBalance()
  }, [account, lootContract, getLootBalance])

  useEffect(() => {
    return () => {
      removeEventListeners()
    }
  }, [removeEventListeners])

  const handleConnect = async () =>  await connect()

  const handleDisconnect = async () => await provider.disconnect()

  return (
    <>
      {!!account ? (
        <>
          <h1>Connected: {account}</h1>
          <button onClick={handleDisconnect}>Disconnect</button>
          <p>You have {lootBalance} Loot(s)</p>
        </>
      ) : (
        <>
          <h1>Disconnected</h1>
          <button onClick={handleConnect}>Connect</button>
        </>
      )}
    </>
  )
}

export default App