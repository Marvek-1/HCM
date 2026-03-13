import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'  // ← This import is required
import './index.css'
import App from './App.jsx'
import ResetPassword from './components/ResetPassword.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A2B4A',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#10B981', secondary: '#fff' },
            style: { background: '#059669' },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
            style: { background: '#DC2626' },
          },
        }}
      />
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)