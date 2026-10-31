import { useState } from 'react'
import { request } from '../api'
import ProbabilityBar from '../components/ProbabilityBar'
import RiskBadge from '../components/RiskBadge'
import recommendations from '../data/recommendations'
import PageHeader from '../components/PageHeader'

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
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = result ? recommendations[result.risk_level] || [] : []

  return (
    <section className="mx-auto max-w-2xl">
      <PageHeader title="Predict customer churn" description="Enter customer activity details to estimate churn risk." />
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm sm:grid-cols-2">
        {fields.map(([name, label, hint]) => (
          <label key={name} className="grid gap-1 text-sm font-medium text-slate-700">
            {label}
            <input
              required
              min={name === 'frequency' || name === 'total_items' ? '1' : name === 'monetary' ? '0.01' : '0'}
              step={name === 'monetary' ? '0.01' : '1'}
              type="number"
              name={name}
              placeholder={hint}
              value={form[name]}
              onChange={handleChange}
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>
        ))}
        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
          <button type="button" onClick={fillExample} className="rounded border border-blue-700 px-4 py-2 font-medium text-blue-700">
            Fill example
          </button>
          <button type="submit" disabled={loading} className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50">
            {loading ? 'Predicting...' : 'Predict churn'}
          </button>
        </div>
      </form>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      {result && (
        <div className="mt-4 rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Prediction result</h2>
            <RiskBadge riskLevel={result.risk_level} />
          </div>
          <ProbabilityBar probability={result.churn_probability} />
          <p className="mt-3">Likely to churn: {result.likely_to_churn ? 'Yes' : 'No'}</p>
          <h3 className="mt-5 font-semibold">Suggested retention actions</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
            {actions.map((action) => <li key={action}>{action}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}
