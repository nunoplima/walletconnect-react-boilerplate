import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'
import { provider as Provider } from 'web3-core'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { useIsMounted } from '@/hooks/useIsMounted'

const provider = new WalletConnectProvider({
  rpc: { 5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' },
})

const App = () => {
  const isMounted = useIsMounted()
  const [account, setAccount] = useState<string | null>(null)
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

  const connect = useCallback(async () => {
    loadProvider()
    loadAccount()
    addEventListeners()
  }, [addEventListeners, loadAccount, loadProvider])


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