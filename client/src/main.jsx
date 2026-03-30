import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './controllers/context/AuthContext'
import { WorkspaceProvider } from './controllers/context/WorkspaceContext'
import { SocketProvider } from './controllers/context/SocketContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </StrictMode>,
)
