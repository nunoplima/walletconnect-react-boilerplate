import React, { useCallback } from 'react'
import { useWeb3Context } from '@contexts/useWeb3Context'
import { LootSection } from '@components/LootSection'

const App = () => {
  const { account, connect, disconnect } = useWeb3Context()

  const handleConnect = useCallback(() => connect(), [connect])

  const handleDisconnect = useCallback(() => disconnect(), [disconnect])

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
      <LootSection />
    </>
  )
}

export default App