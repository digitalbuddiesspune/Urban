import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children }) => {
  const { vendor } = useAuth()
  if (!vendor) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
