import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthPageShell from '../components/AuthPageShell'
import ErrorMessage from '../components/ErrorMessage'
import Spinner from '../components/Spinner'
import { resendOtp } from '../api'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyEmail } = useAuth()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await verifyEmail(email, otp)
      navigate(user.onboarding_completed === false ? '/onboarding' : '/workspace', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    setNotice('')
    try {
      const result = await resendOtp(email)
      setNotice(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthPageShell title="Verify your email" switchText="Already verified?" switchLabel="Sign in" switchTo="/login">
      <p className="mb-6 text-sm text-slate-400">Enter the 6-digit code sent to your email. It expires in 10 minutes.</p>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2 text-xs font-medium text-slate-300">
          Email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" />
        </label>
        <label className="grid gap-2 text-xs font-medium text-slate-300">
          Verification code
          <input required inputMode="numeric" pattern="\d{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="auth-input font-mono tracking-[0.4em]" />
        </label>
        <ErrorMessage message={error} />
        {notice && <p className="text-sm text-emerald-300" role="status">{notice}</p>}
        <button type="submit" disabled={loading} className="rounded-lg bg-[#0b57d0] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
          {loading ? <Spinner label="Verifying..." /> : 'Verify email'}
        </button>
      </form>
      <button type="button" onClick={handleResend} disabled={resending || !email} className="mt-4 w-full text-sm text-blue-300 hover:text-white disabled:opacity-50">
        {resending ? 'Sending...' : 'Resend code'}
      </button>
    </AuthPageShell>
  )
}
