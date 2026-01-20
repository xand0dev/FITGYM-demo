import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext' // Важливо!
import './index.css' // Або './App.css' залежно від того, що у тебе є

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UIProvider> {/* <--- UIProvider має бути всередині або зовні AuthProvider, головне щоб обгортав App */}
            <App />
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)