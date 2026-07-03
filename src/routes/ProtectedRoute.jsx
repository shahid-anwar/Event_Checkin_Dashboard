import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentToken } from '../store/authSlice'

export default function ProtectedRoute() {
  const token = useSelector(selectCurrentToken)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
