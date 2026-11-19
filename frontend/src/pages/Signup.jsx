import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lottie } from 'lottie-react'
import { useAuth } from '../context/AuthContext'
import AuthPageShell from '../components/AuthPageShell'
import ErrorMessage from '../components/ErrorMessage'
import PasswordField from '../components/PasswordField'
import GoogleButton from '../components/GoogleButton'
import signupAnimation from '../assets/isometric-data-analysis.json'

const jobRoles = [
  'Business Owner / Founder',
  'Shop Owner / Retail Seller',
  'Customer Success Manager',
  'Growth / Marketing Manager',
  'Data Analyst / Scientist',
  'Product Manager',
  'Other',
]

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobRole: '',
    termsAccepted: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address.'
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.'
    if (!form.termsAccepted) next.termsAccepted = 'You must accept the terms to continue.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setLoading(true)
    setErrors({})
    try {
      const result = await signup(
        form.name,
        form.email,
        form.password,
        form.jobRole,
        form.termsAccepted,
      )
      navigate('/verify-email', { replace: true, state: { email: result.email } })
    } catch (err) {
      setErrors({ form: err.message || 'Signup failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Create Account"
      subtitle="Join ChurnGuard to predict churn, evaluate cohorts, and safeguard recurring customer revenue."
      switchText="Already have an account?"
      switchLabel="Sign In"
      switchTo="/login"
      illustration={
        <div className="relative w-full max-w-lg flex flex-col items-center">
          <div className="w-full h-[380px] sm:h-[430px] flex items-center justify-center">
            <Lottie
              src={signupAnimation}
              autoplay
              loop
              style={{ width: '100%', height: '100%', minHeight: '360px' }}
              aria-label="Data analysis animation"
            />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#A99BB9]/30" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A99BB9]">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-[#A99BB9]/30" />
        </div>

        {errors.form && <ErrorMessage message={errors.form} />}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="auth-input font-medium"
            />
            {errors.name && <p className="mt-1 text-xs text-[#C87979]">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
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
            {errors.email && <p className="mt-1 text-xs text-[#C87979]">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
              Role in Organization
            </label>
            <select
              name="jobRole"
              value={form.jobRole}
              onChange={handleChange}
              className="auth-input font-medium"
            >
              <option value="" className="bg-[#291C2E] text-white">Select your role (optional)</option>
              {jobRoles.map((r) => (
                <option key={r} value={r} className="bg-[#291C2E] text-white">{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
              Password
            </label>
            <PasswordField
              name="password"
              placeholder="At least 8 characters"
              theme="dark"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p className="mt-1 text-xs text-[#C87979]">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#F4D3B5] mb-1">
              Confirm Password
            </label>
            <PasswordField
              name="confirmPassword"
              placeholder="Re-enter password"
              theme="dark"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-[#C87979]">{errors.confirmPassword}</p>}
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#F4D3B5]/80 cursor-pointer">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={form.termsAccepted}
                onChange={handleChange}
                className="mt-0.5 rounded border-[#A99BB9] text-[#494269] focus:ring-[#E6B95F]"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-[#E6B95F] underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#E6B95F] underline">Privacy Policy</Link>.
              </span>
            </label>
            {errors.termsAccepted && <p className="mt-1 text-xs text-[#C87979]">{errors.termsAccepted}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#E6B95F] py-3.5 text-sm font-bold text-[#291C2E] shadow-md hover:bg-[#D6A34E] transition disabled:opacity-50 btn-interactive cursor-pointer mt-3"
          >
            {loading ? 'Creating Account...' : 'Get Started Free →'}
          </button>
        </form>
      </div>
    </AuthPageShell>
  )
}
