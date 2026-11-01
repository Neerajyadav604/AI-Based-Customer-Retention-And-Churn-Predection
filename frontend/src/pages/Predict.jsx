import { useState } from 'react'
import { request } from '../api'
import { usePlan } from '../context/PlanContext'
import ErrorMessage from '../components/ErrorMessage'
import TrialBanner from '../components/TrialBanner'
import UpgradePrompt from '../components/UpgradePrompt'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'
import recommendations from '../data/recommendations'
import Icon from '../components/Icon'

const fields = [
  ['recency_days', 'Recency (days)', 'Example: 30'],
  ['frequency', 'Orders', 'Example: 5'],
  ['monetary', 'Spend', 'Example: 2500'],
  ['tenure_days', 'Tenure (days)', 'Example: 180'],
  ['total_items', 'Items', 'Example: 12'],
]

const exampleForm = {
  recency_days: '30',
  frequency: '5',
  monetary: '2500',
  tenure_days: '180',
  total_items: '12',
}

// Collect customer details and display the prediction.
export default function Predict() {
  const { refreshPlan } = usePlan()
  const [limitMessage, setLimitMessage] = useState('')
  const [form, setForm] = useState({
    recency_days: '',
    frequency: '',
    monetary: '',
    tenure_days: '',
    total_items: '',
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function fillExample() {
    setForm(exampleForm)
    setError('')
  }

  function validateForm() {
    if (Number(form.frequency) < 1 || Number(form.total_items) < 1) {
      return 'Orders and items must each be at least 1.'
    }
    if (Number(form.monetary) <= 0) {
      return 'Spend must be greater than 0.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setLimitMessage('')
    setResult(null)

    try {
      const values = Object.fromEntries(
        Object.entries(form).map(([name, value]) => [name, Number(value)]),
      )
      const data = await request('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setResult(data)
      refreshPlan()
    } catch (requestError) {
      if (requestError.status === 403) {
        setLimitMessage(requestError.message)
      } else {
        setError(requestError.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const actions = result ? recommendations[result.risk_level] || [] : []

  const probability = result ? Math.round(Number(result.churn_probability) * 1000) / 10 : 0
  const recommendation = actions[0] || 'Review this customer profile and maintain an appropriate retention cadence.'

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Workspace / Predict customer churn</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" />AI model active · Logistic Regression</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Predict customer churn</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Enter customer activity metrics to compute real-time retention probability, risk classification, and prescriptive intervention factors.</p>
      </div>
      <TrialBanner />
      {limitMessage && <UpgradePrompt message={limitMessage} onClose={() => setLimitMessage('')} />}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Activity Inputs</h2>
              <p className="mt-1 text-xs text-slate-400">Parameters derived from the last billing period</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1.5 text-[10px] font-medium text-indigo-600"><Icon name="insights" size={12} />Auto-validated</span>
          </div>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {fields.map(([name, label, hint]) => (
            <label key={name} className="grid gap-2 text-[11px] font-semibold text-slate-700">
              <span className="flex items-center justify-between">{label}<span className="font-normal text-slate-400">{name === 'recency_days' ? 'Since last event' : name === 'frequency' ? 'Total orders' : name === 'monetary' ? 'Lifetime value' : name === 'tenure_days' ? '~6 months' : 'Total items across all orders'}</span></span>
            <input
              required
              min={name === 'frequency' || name === 'total_items' ? '1' : name === 'monetary' ? '0.01' : '0'}
              step={name === 'monetary' ? '0.01' : '1'}
              type="number"
              name={name}
              placeholder={hint.replace('Example: ', '')}
              value={form[name]}
              onChange={handleChange}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50/40 px-3 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={fillExample} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Icon name="recommendations" size={14} />Fill example</button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <Spinner label="Predicting..." /> : <><Icon name="predict" size={14} />Predict churn <span className="text-indigo-200">→</span></>}
            </button>
            <button type="button" onClick={() => { setForm({ recency_days: '', frequency: '', monetary: '', tenure_days: '', total_items: '' }); setResult(null); setError('') }} className="ml-auto text-xs text-slate-400 hover:text-slate-700">Reset</button>
          </div>
        </form>
        <div className="space-y-4">
          <div className="min-h-[282px] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">Prediction insight</p>
              {result && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] text-emerald-600">✓ {Math.max(0, 100 - probability).toFixed(1)}% conf.</span>}
            </div>
            {result ? (
              <>
                <div className="mt-6 flex items-center gap-5">
                  <div className="grid size-24 place-items-center rounded-full" style={{ background: `conic-gradient(#10b981 ${probability}%, #edf2f7 0)` }}>
                    <div className="grid size-16 place-items-center rounded-full bg-white"><strong className="text-lg text-slate-900">{probability}%</strong></div>
                  </div>
                  <div><RiskBadge riskLevel={result.risk_level} /><h3 className="mt-2 text-sm font-semibold text-slate-800">{result.likely_to_churn ? 'At-risk customer profile' : 'Healthy Retention Profile'}</h3><p className="mt-1 text-xs leading-5 text-slate-500">Customer activity indicates {result.likely_to_churn ? 'a higher risk of abandonment.' : 'a lower risk of abandonment.'}</p></div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4"><div className="mb-2 flex justify-between text-[10px] font-semibold text-slate-700"><span>Risk Driver Breakdown</span><span className="font-normal text-slate-400">Model factors</span></div>{[['Recency impact', form.recency_days, 'bg-emerald-500'], ['Spend velocity', `$${Number(form.monetary || 0).toLocaleString()}`, 'bg-indigo-500'], ['Tenure stability', `${form.tenure_days || 0}d`, 'bg-blue-500']].map(([label, value, colour]) => <div key={label} className="mb-2"><div className="flex justify-between text-[10px] text-slate-500"><span>{label}</span><span className="text-slate-700">{value}</span></div><div className="mt-1 h-1 rounded-full bg-slate-100"><div className={`h-1 rounded-full ${colour}`} style={{ width: `${Math.min(100, Math.max(12, Number(form.recency_days || 0) / 2))}%` }} /></div></div>)}</div>
              </>
            ) : <div className="grid h-56 place-items-center text-center text-sm text-slate-400">Complete the activity inputs to see a prediction insight.</div>}
          </div>
          {result && <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white"><Icon name="recommendations" size={15} /></span><div><h3 className="text-xs font-semibold text-slate-800">Recommended Action</h3><p className="mt-1 text-xs leading-5 text-slate-600">{recommendation}</p></div></div></div>}
        </div>
      </div>
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
    </section>
  )
}
