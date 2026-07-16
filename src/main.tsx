import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import PaymentPage from './pages/PaymentPage.tsx'
import AdminPaymentDashboard from './pages/AdminPaymentDashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/admin" element={<AdminPaymentDashboard />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </HashRouter>
  </StrictMode>,
)