import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'
import { provider as Provider } from 'web3-core'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { useIsMounted } from '@hooks/useIsMounted'
import { Status } from '@/types'

type Value = {
  web3?: Web3,
  account?: string,
  connect: () => void,
  disconnect: () => void,
  status: Status,
}
const web3Context = createContext<Value | null>(null)

const useWeb3Context = () => {
  const context = useContext(web3Context)
  if (!context) {
    throw new Error(
      'useWeb3Context must be used within a Web3Provider',
    )
  }
  return context
}

const provider = new WalletConnectProvider({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
    5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  },
})

const Web3ContextProvider = (props: { children: ReactNode }) => {
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<Status>(Status.disconnected)
  const [cashedWalletConnectProvider] = useLocalStorage('walletconnect')
  const isMounted = useIsMounted()

  const loadProvider = useCallback(async () => await provider.enable(), [])

  const loadAccount = useCallback(async () => {
    const web3 = new Web3(provider as unknown as Provider)
    const [account] = await web3.eth.getAccounts()
    setWeb3(web3)
    setAccount(account)
    setStatus(Status.connected)
  }, [])

  const addEventListeners = useCallback(() => {
    provider.on('accountsChanged', (accounts) => setAccount(accounts[0]))
    provider.on('disconnect', () => setAccount(undefined))
  }, [])

  const removeEventListeners = useCallback(() => {
    provider.off('accountsChanged', (accounts) => setAccount(accounts[0]))
    provider.off('disconnect', () => setAccount(undefined))
  }, [])

  const connect = useCallback(() => {
    setStatus(Status.loading)
    loadProvider()
    loadAccount()
    addEventListeners()
  }, [
    addEventListeners,
    loadAccount,
    loadProvider,
  ])

  const disconnect = useCallback(async () => {
    await provider.disconnect()
    setWeb3(undefined)
    setStatus(Status.disconnected)
  }, [])

  useEffect(() => {
    if (!isMounted && cashedWalletConnectProvider.connected) {
      (async () => {
        await connect()
      })()
    }

    return () => {
      removeEventListeners()
    }
  }, [
    cashedWalletConnectProvider,
    connect,
    isMounted,
    addEventListeners,
    removeEventListeners,
  ])

  const value = {
    web3,
    account,
    connect,
    disconnect,
    status,
  }

  return <web3Context.Provider value={value} {...props} />
}

export { useWeb3Context, Web3ContextProvider }
