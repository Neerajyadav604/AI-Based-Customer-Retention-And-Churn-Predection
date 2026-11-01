import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lottie } from 'lottie-react'
import { useAuth } from '../context/AuthContext'
import AuthPageShell from '../components/AuthPageShell'
import ErrorMessage from '../components/ErrorMessage'
import PasswordField from '../components/PasswordField'
import Spinner from '../components/Spinner'
import GoogleButton from '../components/GoogleButton'
import signupAnimation from '../assets/isometric-data-analysis.json'

const jobRoles = ['Business Owner', 'Shop Owner / Seller', 'Data Analyst', 'Customer Success Manager', 'Marketing Manager', 'Product Manager', 'Data Scientist', 'Business Analyst', 'Other']

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', jobRole: '', termsAccepted: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm({ ...form, [event.target.name]: value })
    setErrors({ ...errors, [event.target.name]: '' })
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.'
    if (!form.termsAccepted) next.termsAccepted = 'Accept the Terms and Privacy Policy to continue.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    setLoading(true)
    setErrors({})
    try {
      const result = await signup(form.name, form.email, form.password, form.jobRole, form.termsAccepted)
      navigate('/verify-email', { replace: true, state: { email: result.email } })
    } catch (requestError) {
      setErrors({ form: requestError.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Create Account"
      switchText="Already registered?"
      switchLabel="Sign in"
      switchTo="/login"
      illustration={<Lottie src={signupAnimation} autoplay loop className="h-[460px] w-full max-w-lg" aria-label="Data analysis animation" />}
    >
      <div className="mb-5"><GoogleButton /></div>
      <p className="mb-5 text-center text-xs text-slate-400">Or continue with email</p>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <label className="grid gap-2 text-xs font-medium text-slate-300">Full name
          <input required name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="auth-input" />
          {errors.name && <span className="text-xs text-red-300">{errors.name}</span>}
        </label>
        <label className="grid gap-2 text-xs font-medium text-slate-300">Email
          <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email" className="auth-input" />
          {errors.email && <span className="text-xs text-red-300">{errors.email}</span>}
        </label>
        <label className="grid gap-2 text-xs font-medium text-slate-300">Job role <span className="font-normal text-slate-500">(optional)</span>
          <select name="jobRole" value={form.jobRole} onChange={handleChange} className="auth-input">
            <option value="">Select your role</option>{jobRoles.map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>
        <PasswordField name="password" label="Password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" className="text-slate-300" />
        {errors.password && <span className="text-xs text-red-300">{errors.password}</span>}
        <PasswordField name="confirmPassword" label="Confirm password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="text-slate-300" />
        {errors.confirmPassword && <span className="text-xs text-red-300">{errors.confirmPassword}</span>}
        <label className="flex items-start gap-2 py-1 text-xs text-slate-400">
          <input required type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={handleChange} className="mt-0.5 accent-blue-600" />
          <span>I agree to the <Link to="/terms" className="text-blue-300 hover:text-white">Terms</Link> and <Link to="/privacy" className="text-blue-300 hover:text-white">Privacy Policy</Link>.</span>
        </label>
        {errors.termsAccepted && <span className="text-xs text-red-300">{errors.termsAccepted}</span>}
        <ErrorMessage message={errors.form} />
        <button type="submit" disabled={loading} className="rounded-lg bg-[#0b57d0] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">{loading ? <Spinner label="Creating account..." /> : 'Create Account'}</button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-400">Every new account gets 3 free trials. No card needed.</p>
    </AuthPageShell>
  )
}
