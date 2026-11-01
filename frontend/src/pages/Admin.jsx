import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Show the admin area placeholder for users with admin access.
export default function Admin() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.is_admin === true

  if (!isAdmin) {
    return <Navigate to="/workspace" replace />
  }

  return <section><h1 className="text-3xl font-semibold text-slate-900">Admin</h1><p className="mt-3 text-slate-600">Admin tools will be added here.</p></section>
}
