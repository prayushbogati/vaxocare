import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HeaderContextProvider } from './Context/HeaderContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <HeaderContextProvider>

      <App />

    </HeaderContextProvider>

  </StrictMode>,
)