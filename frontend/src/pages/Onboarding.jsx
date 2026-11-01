import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding, getCurrentUser, saveOnboarding } from '../api'
import ErrorMessage from '../components/ErrorMessage'
import { useAuth } from '../context/AuthContext'

const industries = ['E-commerce and Retail', 'Local Store / Kirana', 'Telecommunications', 'Banking and Financial Services', 'SaaS and Technology', 'Healthcare', 'Insurance', 'Education', 'Media and Entertainment', 'Logistics', 'Other']
const sizes = ['Just me', '2-10 employees', '11-50 employees', '51-200 employees', '201-1,000 employees', '1,000+ employees']
const roles = ['Owner', 'Administrator', 'Analyst', 'Manager', 'Member']
const goals = [
  ['predict_churn', 'Predict which customers are likely to leave'],
  ['understand_why', 'Understand why customers churn'],
  ['high_value_at_risk', 'Identify high-value customers at risk'],
  ['retention_strategies', 'Develop customer retention strategies'],
  ['churn_trends', 'Analyze customer churn trends'],
  ['evaluate_model', 'Evaluate a churn prediction model'],
]

function OptionCard({ selected, onClick, children, hint }) {
  return <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 ${selected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`} aria-pressed={selected}><span className="font-medium">{children}</span>{hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}</button>
}

function Progress({ step }) {
  return <div className="mb-8"><div className="flex justify-between text-xs font-medium text-slate-500"><span>Step {step} of 3</span><span>{Math.round((step / 3) * 100)}%</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: `${(step / 3) * 100}%` }} /></div></div>
}

export default function Onboarding() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(Math.min(3, Math.max(1, Number(user?.onboarding_step) || 1)))
  const [form, setForm] = useState({
    business_name: user?.business_name || '', industry: user?.industry || '', company_size: user?.company_size || '',
    org_role: user?.org_role || '', country: user?.country || 'India', goals: user?.goals || [],
    data_choice: user?.data_choice || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const current = await getCurrentUser()
        updateUser(current)
        setForm((value) => ({ ...value, ...current, country: current.country || 'India', goals: current.goals || [] }))
        if (current.onboarding_step) setStep(Math.min(3, Math.max(1, current.onboarding_step)))
      } catch {
        // AuthContext already handles expired sessions.
      }
    }
    loadUser()
    // Load the latest saved onboarding values once when the page opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function toggleGoal(goal) {
    const nextGoals = form.goals.includes(goal) ? form.goals.filter((item) => item !== goal) : [...form.goals, goal]
    setForm({ ...form, goals: nextGoals })
  }

  async function saveStep(nextStep) {
    setSaving(true)
    setError('')
    try {
      const payload = step === 1
        ? { business_name: form.business_name, industry: form.industry, company_size: form.company_size, org_role: form.org_role, country: form.country, onboarding_step: nextStep }
        : step === 2 ? { goals: form.goals, onboarding_step: nextStep } : { data_choice: form.data_choice, onboarding_step: nextStep }
      const saved = await saveOnboarding(payload)
      updateUser(saved)
      setStep(nextStep)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function finish() {
    if (!form.data_choice) {
      setError('Choose how you want to start.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const saved = await saveOnboarding({ data_choice: form.data_choice, onboarding_step: 3 })
      const completed = await completeOnboarding()
      updateUser({ ...saved, ...completed })
      navigate(form.data_choice === 'csv' || form.data_choice === 'sample' ? '/workspace/upload' : '/workspace', { replace: true, state: { demoData: form.data_choice === 'sample' } })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function continueStep() {
    if (step === 1 && (!form.business_name.trim() || !form.industry || !form.company_size || !form.org_role)) {
      setError('Complete the required business fields.')
      return
    }
    if (step === 2 && form.goals.length === 0) {
      setError('Choose at least one goal.')
      return
    }
    if (step < 3) saveStep(step + 1)
    else finish()
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(115deg,#071426_0%,#0a2850_55%,#111b45_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <p className="mb-8 text-xl font-bold text-white">Churn<span className="text-blue-400">IQ</span></p>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-9">
          <Progress step={step} />
          {step === 1 && <section><h1 className="text-2xl font-semibold">Set up your business</h1><p className="mt-2 text-sm text-slate-500">This helps us tailor your workspace.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">Business name<input required value={form.business_name} onChange={(event) => setForm({ ...form, business_name: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="grid gap-2 text-sm font-medium">Industry<select value={form.industry} onChange={change} name="industry" className="rounded-lg border border-slate-300 px-3 py-2"><option value="">Select industry</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium">Company size<select value={form.company_size} onChange={change} name="company_size" className="rounded-lg border border-slate-300 px-3 py-2"><option value="">Select company size</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium">Your role<select value={form.org_role} onChange={change} name="org_role" className="rounded-lg border border-slate-300 px-3 py-2"><option value="">Select your role</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-medium">Country<input value={form.country} onChange={change} name="country" className="rounded-lg border border-slate-300 px-3 py-2" /></label>
          </div></section>}
          {step === 2 && <section><h1 className="text-2xl font-semibold">What do you want to do with ChurnGuard?</h1><p className="mt-2 text-sm text-slate-500">Select all that apply.</p><div className="mt-6 grid gap-3">{goals.map(([value, label]) => <OptionCard key={value} selected={form.goals.includes(value)} onClick={() => toggleGoal(value)}>{label}</OptionCard>)}</div></section>}
          {step === 3 && <section><h1 className="text-2xl font-semibold">Do you have customer data?</h1><p className="mt-2 text-sm text-slate-500">You can change this later.</p><div className="mt-6 grid gap-3">
            <OptionCard selected={form.data_choice === 'csv'} onClick={() => setForm({ ...form, data_choice: 'csv' })} hint="A simple list with customer, order date and amount is enough.">Yes, I have a CSV file</OptionCard>
            <OptionCard selected={form.data_choice === 'sample'} onClick={() => setForm({ ...form, data_choice: 'sample' })} hint="Clearly labeled demonstration data.">I need a sample dataset to explore</OptionCard>
            <OptionCard selected={form.data_choice === 'not_ready'} onClick={() => setForm({ ...form, data_choice: 'not_ready' })}>I&apos;m not ready to upload data yet</OptionCard>
          </div></section>}
          <ErrorMessage message={error} />
          <div className="mt-8 flex justify-between gap-3"><button type="button" disabled={step === 1 || saving} onClick={() => setStep(step - 1)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 disabled:invisible">Back</button><button type="button" disabled={saving} onClick={continueStep} className="rounded-lg bg-[#0b57d0] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : step === 3 ? 'Finish setup' : 'Continue'}</button></div>
        </div>
      </div>
    </div>
  )
}
