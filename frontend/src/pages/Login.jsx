import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Validate a login email before sending it.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Log in an existing user.
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      const destination = location.state?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Login</h1>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm">
        <label className="grid gap-1 text-sm font-medium">Email
          <input required type="email" name="email" value={form.email} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Password
          <input required minLength="8" type="password" name="password" value={form.password} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" disabled className="rounded border border-slate-300 px-4 py-2 text-slate-500">
          Continue with Google (TODO)
        </button>
        <p className="text-sm text-slate-600">New user? <Link to="/signup" className="text-blue-700">Create an account</Link></p>
      </form>
    </section>
  )
}
