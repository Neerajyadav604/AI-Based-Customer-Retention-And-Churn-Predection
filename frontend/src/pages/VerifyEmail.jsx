import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthPageShell from '../components/AuthPageShell'
import ErrorMessage from '../components/ErrorMessage'
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

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await verifyEmail(email, otp)
      navigate(user.onboarding_completed === false ? '/onboarding' : '/workspace', { replace: true })
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    setNotice('')
    try {
      const res = await resendOtp(email)
      setNotice(res.message || 'A fresh verification code has been dispatched.')
    } catch (err) {
      setError(err.message || 'Could not resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthPageShell
      title="Verify Your Email"
      subtitle="Enter the 6-digit verification code to activate your account."
      switchText="Already verified?"
      switchLabel="Sign In"
      switchTo="/login"
      illustration={
        <div className="size-48 rounded-full bg-[#EBC69F]/20 flex items-center justify-center border-4 border-[#EBC69F]/40 shadow-inner">
          <svg viewBox="0 0 24 24" fill="none" className="size-24 text-[#E6B95F] stroke-current stroke-1.5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      }
    >
      <div className="space-y-4">
        {notice && (
          <div className="rounded-2xl border border-[#7EAA79] bg-[#EAF5E9] p-3.5 text-xs text-[#2D5A27]">
            {notice}
          </div>
        )}
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
              6-Digit Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className="auth-input text-center font-mono text-2xl tracking-[0.3em] font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full rounded-2xl bg-[#E6B95F] py-3.5 text-sm font-bold text-[#291C2E] shadow-md hover:bg-[#D6A34E] transition disabled:opacity-50 btn-interactive cursor-pointer"
          >
            {loading ? 'Verifying Code...' : 'Confirm Verification →'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="text-xs font-semibold text-[#EBC69F] hover:text-white underline"
          >
            {resending ? 'Sending...' : 'Resend Verification Code'}
          </button>
        </div>
      </div>
    </AuthPageShell>
  )
}
