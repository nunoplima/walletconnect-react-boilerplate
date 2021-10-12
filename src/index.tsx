import React from 'react'
import ReactDOM from 'react-dom'
import { Web3ContextProvider } from '@contexts/useWeb3Context'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <App />
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)