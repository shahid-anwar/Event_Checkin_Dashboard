import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import CustomerListPage from './features/customers/CustomerListPage'
import QrScanPage from './features/qrScanner/QrScanPage'
import BoothAssignmentPage from './features/boothAssignment/BoothAssignmentPage'
import CustomerStatusPage from './features/customerStatus/CustomerStatusPage'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/qr-scan" element={<QrScanPage />} />
            <Route path="/booth-assignment" element={<BoothAssignmentPage />} />
            <Route path="/customer-status" element={<CustomerStatusPage />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} />
    </BrowserRouter>
  )
}
