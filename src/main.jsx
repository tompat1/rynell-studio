import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AudioProvider } from './contexts/AudioContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CmsProvider } from './contexts/CmsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CmsProvider>
        <AudioProvider>
          <App />
        </AudioProvider>
      </CmsProvider>
    </AuthProvider>
  </StrictMode>,
)
