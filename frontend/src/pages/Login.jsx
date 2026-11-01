import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthPageShell from '../components/AuthPageShell'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'
import PasswordField from '../components/PasswordField'
import Illustration from '../components/Illustration'
import GoogleButton from '../components/GoogleButton'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(location.state?.error || '')
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
    if (form.password.length < 8 || form.password.length > 64) {
      setError('Password must be between 8 and 64 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const loggedInUser = await login(form.email, form.password)
      const destination = loggedInUser.onboarding_completed === false
        ? '/onboarding'
        : '/'
      navigate(destination, { replace: true })
    } catch (requestError) {
      if (requestError.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: requestError.email || form.email, message: 'Verify your email before signing in.' } })
        return
      }
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell title="Sign In" switchText="New user?" switchLabel="Create an account" switchTo="/signup" illustration={<Illustration />}>
      <div className="mb-6"><GoogleButton /></div>
      <p className="mb-6 text-center text-xs text-slate-400">Or continue with email</p>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2 text-xs font-medium text-slate-300">Email
          <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email" className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </label>
        <PasswordField name="password" label="Password" value={form.password} onChange={handleChange} placeholder="Enter Password" className="text-slate-300" />
        <ErrorMessage message={error} />
        <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
          {loading ? <Spinner label="Signing in..." /> : 'Sign In'}
        </button>
      </form>
    </AuthPageShell>
  )
}
