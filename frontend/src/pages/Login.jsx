import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lottie } from 'lottie-react'
import { useAuth } from '../context/AuthContext'
import AuthPageShell from '../components/AuthPageShell'
import ErrorMessage from '../components/ErrorMessage'
import PasswordField from '../components/PasswordField'
import GoogleButton from '../components/GoogleButton'
import loginAnimation from '../assets/study-discussion.json'

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
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
      const user = await login(form.email, form.password)
      const dest = user.onboarding_completed === false ? '/onboarding' : '/workspace'
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', {
          state: {
            email: err.email || form.email,
            message: 'Please verify your email code before signing in.',
          },
        })
        return
      }
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Welcome Back"
      subtitle="Sign in to your ChurnGuard account to access live cohort analytics and prediction tools."
      switchText="Don't have an account yet?"
      switchLabel="Create Account"
      switchTo="/signup"
      illustration={
        <div className="relative w-full max-w-lg flex flex-col items-center">
          <div className="w-full h-[380px] sm:h-[430px] flex items-center justify-center">
            <Lottie
              src={loginAnimation}
              autoplay
              loop
              style={{ width: '100%', height: '100%', minHeight: '360px' }}
              aria-label="Discussion animation"
            />
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#A99BB9]/30" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A99BB9]">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-[#A99BB9]/30" />
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              className="auth-input font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1.5">
              Password
            </label>
            <PasswordField
              name="password"
              placeholder="••••••••"
              theme="dark"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#E6B95F] py-3.5 text-sm font-bold text-[#291C2E] shadow-md hover:bg-[#D6A34E] transition disabled:opacity-50 btn-interactive cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace →'}
          </button>
        </form>
      </div>
    </AuthPageShell>
  )
}
