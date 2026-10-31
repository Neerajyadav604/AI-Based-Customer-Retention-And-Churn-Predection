import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Validate a signup email before sending it.
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Create and log in a new user.
export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await signup(form.name, form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Signup</h1>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm">
        <label className="grid gap-1 text-sm font-medium">Name
          <input required type="text" name="name" value={form.name} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Email
          <input required type="email" name="email" value={form.email} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Password
          <input required minLength="8" type="password" name="password" value={form.password} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Confirm password
          <input required minLength="8" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="rounded border border-slate-300 px-3 py-2" />
        </label>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <button type="button" disabled className="rounded border border-slate-300 px-4 py-2 text-slate-500">
          Continue with Google (TODO)
        </button>
        <p className="text-sm text-slate-600">Already registered? <Link to="/login" className="text-blue-700">Login</Link></p>
      </form>
    </section>
  )
}
