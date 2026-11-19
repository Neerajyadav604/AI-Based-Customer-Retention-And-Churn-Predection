import { useState } from 'react'
import { request } from '../api'
import { usePlan } from '../context/PlanContext'
import ErrorMessage from '../components/ErrorMessage'
import TrialBanner from '../components/TrialBanner'
import UpgradePrompt from '../components/UpgradePrompt'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'
import Card from '../components/Card'
import AnimatedRiskOrb from '../components/AnimatedRiskOrb'
import recommendations from '../data/recommendations'
import { DoodleSparkle } from '../components/Doodles'

const fields = [
  ['recency_days', 'Recency (Days since last order)', 'e.g., 30', 'Days elapsed since the customer last bought.'],
  ['frequency', 'Total Orders Placed', 'e.g., 5', 'Cumulative successful purchases.'],
  ['monetary', 'Total Cumulative Spend (₹)', 'e.g., 2500', 'Total revenue generated across lifetime.'],
  ['tenure_days', 'Account Tenure (Days)', 'e.g., 180', 'Days since first known purchase or registration.'],
  ['total_items', 'Total Items Purchased', 'e.g., 12', 'Sum of all physical items ordered.'],
]

const exampleForm = {
  recency_days: '42',
  frequency: '3',
  monetary: '3400',
  tenure_days: '190',
  total_items: '8',
}

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function fillExample() {
    setForm(exampleForm)
    setError('')
  }

  function validateForm() {
    if (Number(form.frequency) < 1 || Number(form.total_items) < 1) {
      return 'Orders and total items must each be at least 1.'
    }
    if (Number(form.monetary) <= 0) {
      return 'Spend must be greater than 0.'
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload = {
        recency_days: Number(form.recency_days),
        frequency: Number(form.frequency),
        monetary: Number(form.monetary),
        tenure_days: Number(form.tenure_days),
        total_items: Number(form.total_items),
      }
      const data = await request('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setResult(data)
      refreshPlan?.()
    } catch (err) {
      if (err.status === 403) {
        setLimitMessage(err.message || 'Trial quota exhausted. Upgrade to continue predicting.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const rec = result?.risk_level ? recommendations[result.risk_level] : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Inference Engine
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Logistic Regression
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Single Customer Predictor
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Input individual account behavioral metrics to calculate immediate defection probability.
          </p>
        </div>

        <button
          type="button"
          onClick={fillExample}
          className="rounded-2xl border-1.5 border-[#EBC69F] bg-[#FFF8ED] px-4 py-2 text-xs font-semibold text-[#494269] hover:bg-[#EBC69F] transition btn-interactive"
        >
          ⚡ Load Sample Data
        </button>
      </div>

      <TrialBanner />
      {limitMessage && <UpgradePrompt message={limitMessage} onClose={() => setLimitMessage('')} />}
      {error && <ErrorMessage message={error} />}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-7">
          <Card className="rounded-3xl border-[#EBC69F]">
            <h2 className="font-editorial text-2xl font-bold text-[#291C2E] mb-1">
              Customer Metrics Input
            </h2>
            <p className="text-xs text-[#392D35] mb-6">
              All 5 parameters are engineered into normalized behavioral vectors by the pipeline.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map(([name, label, placeholder, hint]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={name} className="text-xs font-bold uppercase tracking-wider text-[#291C2E]">
                      {label}
                    </label>
                    <span className="text-[10px] text-[#A99BB9]">{hint}</span>
                  </div>
                  <input
                    id={name}
                    name={name}
                    type="number"
                    step="any"
                    required
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#EBC69F] bg-[#FFF3E4] px-4 py-2.5 font-mono text-sm text-[#291C2E] placeholder-[#A99BB9] transition focus:border-[#494269] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#494269]/15 shadow-inner"
                  />
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#494269] py-3.5 text-sm font-semibold text-[#FFF3E4] shadow-md hover:bg-[#373152] transition disabled:opacity-50 btn-interactive"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Evaluating Churn Probability...
                    </span>
                  ) : (
                    'Run Prediction Model →'
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Prediction Results Panel */}
        <div className="lg:col-span-5">
          {result ? (
            <Card className="rounded-3xl border-2 border-[#E6B95F] bg-white p-7 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#EBC69F]/50 pb-4">
                <div className="flex items-center gap-2">
                  <RiskBadge riskLevel={result.risk_level} size="md" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#494269]">
                    Result
                  </span>
                </div>
                <DoodleSparkle size={18} className="text-[#E6B95F]" />
              </div>

              {/* Animated 3D Risk Orb with live 0 to Target count-up & glossy gauge */}
              <AnimatedRiskOrb
                targetProbability={result.churn_probability}
                riskLevel={result.risk_level}
                likelyToChurn={result.likely_to_churn}
              />

              <div className="text-center my-4">
                <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                  {result.likely_to_churn ? 'Likely to Churn' : 'Retention Safe'}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#392D35] max-w-xs mx-auto">
                  {result.likely_to_churn
                    ? 'Account has crossed the sensitivity threshold and requires immediate proactive outreach.'
                    : 'Customer purchasing trajectory remains within healthy retention thresholds.'}
                </p>
              </div>

              {/* Actionable recommendations card */}
              {rec && (
                <div className="mt-5 rounded-2xl border border-[#EBC69F] bg-[#FFF8ED] p-5 text-xs text-[#291C2E]">
                  <p className="font-bold text-[#494269] uppercase tracking-wider text-[10px] mb-1">
                    Playbook Action
                  </p>
                  <h4 className="font-editorial text-lg font-bold text-[#291C2E]">
                    {rec.headline || `${result.risk_level} Risk Strategy`}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#392D35]">
                    {rec.action || rec.summary}
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="rounded-3xl border-dashed border-2 border-[#EBC69F] bg-[#FFF8ED]/40 p-10 text-center">
              <div className="size-16 rounded-full bg-[#EBC69F]/40 mx-auto flex items-center justify-center text-[#494269] mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="size-8 stroke-current stroke-2">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
                Awaiting Evaluation
              </h3>
              <p className="mt-2 text-xs text-[#392D35] max-w-xs mx-auto leading-relaxed">
                Fill in the customer numbers on the left or click "Load Sample Data" to see immediate churn scoring.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
