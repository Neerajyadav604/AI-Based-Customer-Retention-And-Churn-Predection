import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

// Protect a page and remember where the user wanted to go.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Spinner label="Checking your login..." />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
