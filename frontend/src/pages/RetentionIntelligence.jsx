import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  getRetentionAnalysis,
  getLatestRetentionAnalysis,
  updateCustomerAction,
} from '../api'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import RiskBadge from '../components/RiskBadge'
import { DoodleSparkle } from '../components/Doodles'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

export default function RetentionIntelligence() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uploadIdParam = searchParams.get('upload_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [datasetData, setDatasetData] = useState(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  // Action tracking state: { [actionId]: { status: 'pending'|'in_progress'|'completed', notes: '' } }
  const [actionsState, setActionsState] = useState({})
  const [savingActionId, setSavingActionId] = useState(null)

  // 1. Fetch analysis for specified or latest upload dataset
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      setError('')
      try {
        let res = null
        if (uploadIdParam) {
          res = await getRetentionAnalysis(uploadIdParam)
        } else {
          // Check cached session data first
          const cached = sessionStorage.getItem('churnguard_latest_retention_dataset')
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              if (parsed?.uploadId) {
                res = await getRetentionAnalysis(parsed.uploadId)
              }
            } catch (e) {
              console.warn('Could not parse cached dataset:', e)
            }
          }
          if (!res) {
            res = await getLatestRetentionAnalysis()
          }
        }

        if (isMounted && res) {
          setDatasetData(res)
          if (res.customers && res.customers.length > 0) {
            // Default to the highest risk customer
            setSelectedCustomerId(res.customers[0].customer_id)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[RETENTION LOAD ERROR]', err)
          setError(
            err.message ||
              'No completed retention dataset found. Please run a batch prediction from Upload or select one from History.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [uploadIdParam])

  // Currently selected customer object
  const activeCustomer = useMemo(() => {
    if (!datasetData?.customers || !selectedCustomerId) return null
    return (
      datasetData.customers.find(
        (c) => String(c.customer_id) === String(selectedCustomerId)
      ) || datasetData.customers[0]
    )
  }, [datasetData, selectedCustomerId])

  // Load action tracking from localStorage / active customer
  useEffect(() => {
    if (!activeCustomer?.customer_id) return
    const key = `cg_action_tracking_${activeCustomer.customer_id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setActionsState(JSON.parse(saved))
      } catch {
        setActionsState({})
      }
    } else {
      setActionsState({})
    }
  }, [activeCustomer?.customer_id])

  // Handle action status toggle
  async function handleActionStatusChange(actionId, newStatus) {
    if (!activeCustomer) return
    const updated = {
      ...actionsState,
      [actionId]: {
        status: newStatus,
        notes: actionsState[actionId]?.notes || '',
        updatedAt: new Date().toISOString(),
      },
    }
    setActionsState(updated)

    const key = `cg_action_tracking_${activeCustomer.customer_id}`
    localStorage.setItem(key, JSON.stringify(updated))

    // Sync to backend asynchronously
    try {
      setSavingActionId(actionId)
      await updateCustomerAction(
        activeCustomer.customer_id,
        actionId,
        newStatus,
        updated[actionId].notes
      )
    } catch (e) {
      console.warn('Backend action tracking sync deferred:', e)
    } finally {
      setSavingActionId(null)
    }
  }

  // Filtered customer list for the selector
  const filteredCustomers = useMemo(() => {
    if (!datasetData?.customers) return []
    if (!searchFilter.trim()) return datasetData.customers
    const q = searchFilter.toLowerCase()
    return datasetData.customers.filter((c) =>
      String(c.customer_id).toLowerCase().includes(q)
    )
  }, [datasetData, searchFilter])

  // SHAP Bar Chart Data formatted for Recharts
  const shapChartData = useMemo(() => {
    if (!activeCustomer?.features_breakdown) return []
    return activeCustomer.features_breakdown
      .map((f) => ({
        feature: f.label.split('(')[0].trim(),
        fullLabel: f.label,
        shap: f.shap_value,
        impact: f.impact_percentage,
        color: f.shap_value > 0 ? '#B83838' : '#43823C',
        direction: f.direction,
      }))
      .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
  }, [activeCustomer])

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Spinner label="Loading SHAP explanation and retention intelligence..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12">
        <Card className="rounded-3xl border-2 border-[#EBC69F] bg-[#FFF8ED] p-8 text-center space-y-4">
          <div className="size-16 rounded-2xl bg-[#FAECEC] text-[#8C2A2A] mx-auto flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">
            Retention Intelligence Unreachable
          </h2>
          <ErrorMessage message={error} />
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              to="/workspace/upload"
              className="rounded-xl bg-[#494269] px-5 py-2.5 text-xs font-semibold text-[#FFF3E4] hover:bg-[#373152] transition"
            >
              Go to CSV Upload →
            </Link>
            <Link
              to="/workspace/history"
              className="rounded-xl border border-[#EBC69F] bg-white px-5 py-2.5 text-xs font-semibold text-[#494269] hover:bg-[#FAF2DF] transition"
            >
              Browse Upload History
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (!activeCustomer) {
    return <Card className="p-8">No customer data available in this dataset.</Card>
  }

  const {
    customer_id,
    churn_percentage,
    risk_tier,
    risk_color,
    base_model_probability,
    raw_attributes,
    risk_drivers,
    protective_drivers,
    waterfall_steps,
    business_consequences,
    recommendations,
  } = activeCustomer

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ========================================================
          PAGE TOP HEADER & BREADCRUMBS
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Prescriptive AI • Dedicated Analysis
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Dataset #{datasetData?.upload_id || 'Active'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Retention Intelligence & SHAP Analytics
            </h1>
            <DoodleSparkle size={22} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35] max-w-2xl leading-relaxed">
            Deconstruct individual churn drivers using game-theoretic SHAP attributions and execute prioritized, high-ROI retention interventions.
          </p>
        </div>

        {/* Back / Export Controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/workspace/upload"
            className="rounded-xl border border-[#EBC69F] bg-[#FFF8ED] px-4 py-2 text-xs font-semibold text-[#494269] hover:bg-[#FAF2DF] transition"
          >
            ← Upload Another CSV
          </Link>
          <Link
            to="/workspace/history"
            className="rounded-xl bg-[#494269] px-4 py-2 text-xs font-semibold text-[#FFF3E4] hover:bg-[#373152] transition"
          >
            Upload History
          </Link>
        </div>
      </div>

      {/* ========================================================
          1. CUSTOMER SELECTOR & DATASET COHORT OVERVIEW
          ======================================================== */}
      <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#494269]/80">
              1. Select Customer Account for Deep-Dive Analysis
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search account ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48 rounded-xl border border-[#EBC69F] bg-[#FFF8ED] px-3 py-1.5 text-xs text-[#291C2E] placeholder-[#A99BB9] focus:outline-none focus:ring-1 focus:ring-[#494269]"
              />

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="rounded-xl border border-[#494269] bg-white px-3 py-1.5 text-xs font-bold text-[#291C2E] shadow-xs cursor-pointer focus:outline-none"
              >
                {filteredCustomers.map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>
                    Customer #{c.customer_id} — {c.churn_percentage}% ({c.risk_tier} Risk)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dataset Cohort Quick Stats */}
          <div className="flex items-center gap-3 text-xs bg-[#FFF8ED] p-3 rounded-2xl border border-[#EBC69F]/60">
            <div>
              <p className="text-[10px] text-[#A99BB9] font-mono">Dataset</p>
              <p className="font-semibold text-[#291C2E] truncate max-w-[140px]">
                {datasetData?.file_name || `Upload #${datasetData?.upload_id}`}
              </p>
            </div>
            <div className="h-6 w-px bg-[#EBC69F]" />
            <div>
              <p className="text-[10px] text-[#A99BB9] font-mono">Accounts</p>
              <p className="font-bold text-[#291C2E]">{datasetData?.total_customers}</p>
            </div>
            <div className="h-6 w-px bg-[#EBC69F]" />
            <div>
              <p className="text-[10px] text-[#8C2A2A] font-mono">High Risk</p>
              <p className="font-bold text-[#B83838]">{datasetData?.high_risk_count}</p>
            </div>
            <div className="h-6 w-px bg-[#EBC69F]" />
            <div>
              <p className="text-[10px] text-[#8C6819] font-mono">Revenue at Risk</p>
              <p className="font-bold text-[#8C6819]">
                ₹{(datasetData?.total_revenue_at_risk || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================
          2. INDIVIDUAL CHURN PROBABILITY & BEHAVIORAL PROFILE
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Probability Badge Card */}
        <Card
          className="rounded-3xl border-2 p-6 flex flex-col justify-between"
          style={{ borderColor: risk_color }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#494269]/80">
                2. Churn Risk Score
              </span>
              <RiskBadge level={risk_tier} />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span
                className="font-editorial text-5xl font-black tracking-tight"
                style={{ color: risk_color }}
              >
                {churn_percentage}%
              </span>
              <span className="text-xs text-[#392D35] font-medium">
                churn probability
              </span>
            </div>

            {/* Visual Risk Progress Bar */}
            <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-[#EBC69F]/30 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(5, churn_percentage))}%`,
                  backgroundColor: risk_color,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-[#392D35] leading-relaxed">
              Customer #{customer_id} has a{' '}
              <strong style={{ color: risk_color }}>{churn_percentage}% probability</strong>{' '}
              of churning within the next 30 days. Baseline model population rate is{' '}
              <strong className="text-[#494269]">{base_model_probability}%</strong>.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBC69F]/50 flex items-center justify-between text-xs">
            <span className="text-[#392D35]">Cohort Baseline Shift:</span>
            <span
              className="font-mono font-bold"
              style={{
                color: churn_percentage >= base_model_probability ? '#B83838' : '#43823C',
              }}
            >
              {churn_percentage >= base_model_probability ? '+' : ''}
              {(churn_percentage - base_model_probability).toFixed(1)}% vs population
            </span>
          </div>
        </Card>

        {/* Behavioral RFM Telemetry Attributes */}
        <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#EBC69F]/50 pb-3 mb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#291C2E]">
                Account Behavioral Profile (Raw RFM)
              </h3>
              <p className="text-xs text-[#392D35]">
                Exact telemetry metrics calculated from customer order history.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-[#8C6819] bg-[#FAF2DF] px-2.5 py-1 rounded-xl">
              #{customer_id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#494269]/70">Recency</p>
              <p className="font-mono text-xl font-bold text-[#291C2E]">
                {raw_attributes.recency_days} <span className="text-xs font-normal">days</span>
              </p>
              <p className="text-[10px] text-[#A99BB9]">Since last purchase</p>
            </div>

            <div className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#494269]/70">Frequency</p>
              <p className="font-mono text-xl font-bold text-[#291C2E]">
                {raw_attributes.frequency} <span className="text-xs font-normal">orders</span>
              </p>
              <p className="text-[10px] text-[#A99BB9]">Lifetime completed</p>
            </div>

            <div className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#494269]/70">Monetary Spend</p>
              <p className="font-mono text-xl font-bold text-[#291C2E]">
                ₹{raw_attributes.monetary.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#A99BB9]">Gross lifetime revenue</p>
            </div>

            <div className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#494269]/70">Tenure</p>
              <p className="font-mono text-xl font-bold text-[#291C2E]">
                {raw_attributes.tenure_days} <span className="text-xs font-normal">days</span>
              </p>
              <p className="text-[10px] text-[#A99BB9]">Relationship age</p>
            </div>

            <div className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#494269]/70">Items Bought</p>
              <p className="font-mono text-xl font-bold text-[#291C2E]">
                {raw_attributes.total_items}
              </p>
              <p className="text-[10px] text-[#A99BB9]">Basket volume</p>
            </div>

            <div className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-[#494269]/70">Avg Order Value</p>
              <p className="font-mono text-xl font-bold text-[#291C2E]">
                ₹{raw_attributes.avg_order_value.toFixed(2)}
              </p>
              <p className="text-[10px] text-[#A99BB9]">Per-transaction basket</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================
          3 & 4. SHAP-BASED EXPLANATION & INCREASING/DECREASING FACTORS
          ======================================================== */}
      <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">
              3. SHAP Attribution & Mathematical Explanation
            </h2>
            <DoodleSparkle size={18} className="text-[#E6B95F]" />
          </div>
          <p className="text-xs text-[#392D35] mt-1 max-w-3xl leading-relaxed">
            Shapley Additive exPlanations (SHAP) break down exactly why Customer #{customer_id} received a {churn_percentage}% churn score.
          </p>
        </div>

        {/* In Simple Words Callout Box */}
        <div className="rounded-2xl border-2 border-[#EBC69F] bg-[#FFF8ED] p-4 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-[#291C2E]">
            <span className="text-base">💡</span>
            <span className="font-editorial text-sm font-bold text-[#291C2E]">
              How This Score Works (In Plain English)
            </span>
          </div>

          <p className="text-[#392D35] leading-relaxed">
            Every customer starts at our baseline average churn rate of <strong>{base_model_probability}%</strong>.
            Our AI then analyzes Customer #{customer_id}&apos;s real shopping records:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#C87979]/40 bg-[#FAECEC]/70 p-3">
              <p className="font-bold text-[#8C2A2A] flex items-center gap-1.5">
                <span>🔴</span>
                <span>Red Factors (Pulling Them Away):</span>
              </p>
              <p className="text-[11px] text-[#8C2A2A] mt-1 leading-relaxed">
                Habits that push their churn risk <strong>UP</strong> — such as ordering only once or twice, or not visiting for many days.
              </p>
            </div>

            <div className="rounded-xl border border-[#7EAA79]/40 bg-[#EAF5E9]/70 p-3">
              <p className="font-bold text-[#2D5A27] flex items-center gap-1.5">
                <span>🟢</span>
                <span>Green Factors (Keeping Them Loyal):</span>
              </p>
              <p className="text-[11px] text-[#2D5A27] mt-1 leading-relaxed">
                Habits that pull their churn risk <strong>DOWN</strong> — such as healthy total spend in Rupees (₹) or a long relationship.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#494269] font-medium pt-0.5">
            <strong>Bottom Line:</strong> Adding up all positive and negative factors shifts the score from {base_model_probability}% to <strong>{churn_percentage}%</strong>. The playbook in Section 6 targets their biggest red factor directly!
          </p>
        </div>

        {/* Side-by-side: Increasing vs Decreasing Drivers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Factors INCREASING Churn Probability (Risk Drivers) */}
          <div className="rounded-2xl border-2 border-[#C87979] bg-[#FAECEC]/40 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#C87979]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-[#B83838] text-white text-xs font-bold">
                  ↑
                </span>
                <h3 className="font-bold text-sm text-[#8C2A2A]">
                  4a. Risk Drivers (Increasing Churn Risk)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8C2A2A] font-bold">
                {risk_drivers.length} factors
              </span>
            </div>

            {risk_drivers.length === 0 ? (
              <p className="text-xs text-[#2D5A27] italic py-4">
                ✓ No adverse features pushing churn probability upward.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {risk_drivers.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-[#C87979]/60 bg-white p-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#291C2E]">
                        {d.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#B83838]">
                        +{d.impact_percentage}% risk
                      </span>
                    </div>
                    <p className="text-[11px] text-[#392D35] mt-1">
                      Current Value: <strong className="font-mono text-[#291C2E]">{d.raw_value} {d.unit}</strong> • SHAP: +{d.shap_value}
                    </p>
                    <p className="text-[10px] text-[#A99BB9] mt-0.5">{d.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Factors DECREASING Churn Probability (Protective Drivers) */}
          <div className="rounded-2xl border-2 border-[#7EAA79] bg-[#EAF5E9]/40 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#7EAA79]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-lg bg-[#43823C] text-white text-xs font-bold">
                  ↓
                </span>
                <h3 className="font-bold text-sm text-[#2D5A27]">
                  4b. Protective Drivers (Decreasing Churn Risk)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#2D5A27] font-bold">
                {protective_drivers.length} factors
              </span>
            </div>

            {protective_drivers.length === 0 ? (
              <p className="text-xs text-[#8C2A2A] italic py-4">
                ⚠️ No protective features mitigating churn risk.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {protective_drivers.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-[#7EAA79]/60 bg-white p-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#291C2E]">
                        {d.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#43823C]">
                        {d.impact_percentage}% risk
                      </span>
                    </div>
                    <p className="text-[11px] text-[#392D35] mt-1">
                      Current Value: <strong className="font-mono text-[#291C2E]">{d.raw_value} {d.unit}</strong> • SHAP: {d.shap_value}
                    </p>
                    <p className="text-[10px] text-[#A99BB9] mt-0.5">{d.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {/* ========================================================
          5. SHAP BAR & WATERFALL VISUALIZATIONS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Relative Feature Attribution Bar Chart */}
        <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-6">
          <div className="border-b border-[#EBC69F]/50 pb-3 mb-4">
            <h3 className="font-editorial text-lg font-bold text-[#291C2E]">
              5a. SHAP Feature Attribution (Log-Odds)
            </h3>
            <p className="text-xs text-[#392D35]">
              Red bars increase churn risk; green bars defend against churn.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shapChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#392D35' }}
                  tickFormatter={(val) => {
                    const num = Number(val)
                    return isNaN(num) ? val : num.toFixed(2)
                  }}
                  domain={['dataMin - 0.2', 'dataMax + 0.2']}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={125}
                  tick={{ fontSize: 11, fill: '#291C2E', fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(230, 185, 95, 0.18)' }}
                  wrapperStyle={{ outline: 'none', zIndex: 100 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null
                    const data = payload[0].payload
                    const isPositive = data.shap > 0
                    return (
                      <div className="rounded-2xl border-2 border-[#EBC69F] bg-[#FFF8ED] p-3.5 shadow-xl text-[#291C2E]">
                        <p className="font-editorial text-sm font-bold text-[#291C2E]">
                          {data.fullLabel || data.feature}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono">
                          <span
                            className="font-bold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: isPositive ? '#FAECEC' : '#EAF5E9',
                              color: isPositive ? '#B83838' : '#43823C',
                            }}
                          >
                            SHAP Attribution: {isPositive ? '+' : ''}{Number(data.shap).toFixed(4)}
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: isPositive ? '#B83838' : '#43823C' }}
                          >
                            {isPositive ? 'Increases churn risk' : 'Protects retention'} ({Math.abs(data.impact).toFixed(1)}%)
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] font-sans text-[#392D35] max-w-xs leading-snug">
                          {isPositive
                            ? '🔴 This habit pushes their risk UP. Our retention strategy directly targets this.'
                            : '🟢 This positive behavior helps DEFEND against churn.'}
                        </p>
                      </div>
                    )
                  }}
                />
                <ReferenceLine x={0} stroke="#494269" strokeWidth={1.5} />
                <Bar dataKey="shap" radius={[4, 4, 4, 4]}>
                  {shapChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* SHAP Step-by-Step Waterfall Progression */}
        <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-6">
          <div className="border-b border-[#EBC69F]/50 pb-3 mb-4">
            <h3 className="font-editorial text-lg font-bold text-[#291C2E]">
              5b. SHAP Waterfall Progression (Base → Final)
            </h3>
            <p className="text-xs text-[#392D35]">
              Cumulative impact of each behavioral feature leading to the {churn_percentage}% prediction.
            </p>
          </div>

          <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
            {waterfall_steps.map((w, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl border border-[#EBC69F]/40 bg-[#FFF8ED] text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: w.color }}
                  />
                  <span className="font-sans font-semibold text-[#291C2E] truncate max-w-[160px]">
                    {w.step}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="font-bold text-[11px]"
                    style={{ color: w.color }}
                  >
                    {w.contribution_log_odds > 0 ? '+' : ''}
                    {w.contribution_log_odds} logit
                  </span>
                  <span className="font-bold text-xs bg-white border border-[#EBC69F]/60 px-2 py-0.5 rounded-md text-[#291C2E]">
                    {w.resulting_probability}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ========================================================
          6 & 7. RETENTION RECOMMENDATIONS, DISCOUNTS & INCENTIVES
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook Headline & Strategy */}
        <Card className="rounded-3xl border-2 border-[#E6B95F] bg-[#FAF2DF]/40 p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6B95F]/60 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6819]">
                6. Prescriptive Retention Strategy
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#291C2E] mt-0.5">
                {recommendations.headline}
              </h3>
            </div>
            <span className="rounded-full bg-[#E6B95F] px-3 py-1 text-xs font-bold text-[#291C2E]">
              Primary Driver: {recommendations.primary_risk_driver.split('(')[0]}
            </span>
          </div>

          {/* Simple Explanation & Why This Strategy Works */}
          <div className="rounded-2xl border-2 border-[#E6B95F] bg-[#FFF8ED] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <h4 className="font-editorial text-sm font-bold text-[#8C6819]">
                Simple Explanation & Why This Strategy Works
              </h4>
            </div>
            <p className="text-xs text-[#291C2E] leading-relaxed">
              {recommendations.why_strategy || (
                `Customer #${customer_id}'s primary warning sign is ${recommendations.primary_risk_driver.split('(')[0]}. Instead of generic discounts that waste money, this targeted strategy focuses directly on what they need so they become a confident, habitual buyer.`
              )}
            </p>
          </div>

          {/* Suggested Discounts & Incentives */}
          <div className="rounded-2xl border border-[#E6B95F] bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#8C6819] flex items-center gap-1.5">
              <span>🎁</span>
              <span>7. Calibrated Incentives, Discounts & Perks</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-[#EBC69F] bg-[#FFF8ED] p-3">
                <p className="text-[10px] font-bold uppercase text-[#494269]/70">
                  Targeted Promotional Offer
                </p>
                <p className="font-bold text-xs text-[#B83838] mt-1">
                  {String(recommendations.suggested_incentives?.discount_offer || '').replace(/\$/g, '₹')}
                </p>
                <span className="inline-block mt-1 rounded bg-[#FAECEC] px-2 py-0.5 text-[9px] font-bold text-[#B83838]">
                  {String(recommendations.suggested_incentives?.badge || '').replace(/\$/g, '₹')}
                </span>
              </div>

              <div className="rounded-xl border border-[#EBC69F] bg-[#FFF8ED] p-3">
                <p className="text-[10px] font-bold uppercase text-[#494269]/70">
                  Loyalty & Relationship Benefit
                </p>
                <p className="font-bold text-xs text-[#2D5A27] mt-1">
                  {String(recommendations.suggested_incentives?.loyalty_benefit || '').replace(/\$/g, '₹')}
                </p>
                <span className="inline-block mt-1 rounded bg-[#EAF5E9] px-2 py-0.5 text-[9px] font-bold text-[#2D5A27]">
                  Retention Shield
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 8. ESTIMATED BUSINESS CONSEQUENCES & ROI */}
        <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#EBC69F]/50 pb-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#494269]/80">
                8. Business Consequences
              </span>
              <h3 className="font-editorial text-lg font-bold text-[#291C2E] mt-0.5">
                Financial Impact & Cost of Inaction
              </h3>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[#C87979]/50 bg-[#FAECEC]/60 p-3">
                <p className="text-[10px] font-bold uppercase text-[#8C2A2A]">
                  Annual Gross Revenue at Risk
                </p>
                <p className="font-mono text-2xl font-black text-[#B83838] mt-0.5">
                  ₹{Number(business_consequences.revenue_at_risk || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#8C2A2A] mt-1">
                  {String(business_consequences.cost_of_inaction || '').replace(/\$/g, '₹')}
                </p>
              </div>

              <div className="rounded-xl border border-[#EBC69F]/60 bg-[#FFF8ED] p-3">
                <p className="text-[10px] font-bold uppercase text-[#494269]/70">
                  Customer Lifetime Value (CLV)
                </p>
                <p className="font-mono text-xl font-bold text-[#291C2E] mt-0.5">
                  ₹{Number(business_consequences.estimated_clv || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#A99BB9]">Projected over 36 months</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EBC69F]/50">
            <p className="text-[10px] text-[#392D35] flex items-center justify-between">
              <span>Max Recommended Concession:</span>
              <strong className="font-mono text-[#8C6819]">
                {String(business_consequences.recommended_budget || '').replace(/\$/g, '₹')}
              </strong>
            </p>
            <p className="text-[10px] text-[#2D5A27] font-semibold mt-1">
              Projected ROI: {String(recommendations.suggested_incentives?.projected_roi || '').replace(/\$/g, '₹')}
            </p>
          </div>
        </Card>
      </div>

      {/* ========================================================
          9 & 10. PRIORITIZED ACTION PLAN & INTERACTIVE TRACKING
          ======================================================== */}
      <Card className="rounded-3xl border-2 border-[#EBC69F] bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBC69F]/50 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
                9 & 10. Prioritized Retention Action Plan & Execution Tracking
              </h3>
              <DoodleSparkle size={18} className="text-[#E6B95F]" />
            </div>
            <p className="text-xs text-[#392D35] mt-0.5">
              Execute phased interventions and track operational delivery status for Customer #{customer_id}.
            </p>
          </div>

          <span className="text-[10px] font-mono font-semibold bg-[#FAF2DF] border border-[#EBC69F] text-[#8C6819] px-2.5 py-1 rounded-xl">
            Live Execution Board
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.action_plan.map((act) => {
            const currentStatus = actionsState[act.id]?.status || 'pending'
            const isSaving = savingActionId === act.id

            return (
              <div
                key={act.id}
                className={`rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                  currentStatus === 'completed'
                    ? 'border-[#7EAA79] bg-[#EAF5E9]/40'
                    : currentStatus === 'in_progress'
                    ? 'border-[#E6B95F] bg-[#FAF2DF]/50'
                    : 'border-[#EBC69F] bg-[#FFF8ED]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-white border border-[#EBC69F]/80 px-2 py-0.5 text-[9px] font-bold text-[#494269] uppercase">
                      {act.phase}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        act.urgency === 'High'
                          ? 'bg-[#B83838] text-white'
                          : act.urgency === 'Medium'
                          ? 'bg-[#E6B95F] text-[#291C2E]'
                          : 'bg-[#43823C] text-white'
                      }`}
                    >
                      {act.urgency} Urgency
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#291C2E] mt-1">{act.title}</h4>
                  <p className="text-xs text-[#392D35] mt-1.5 leading-relaxed">
                    {act.description}
                  </p>

                  <p className="mt-2 text-[10px] font-mono text-[#A99BB9]">
                    Channel: {act.channel}
                  </p>
                </div>

                {/* Status Toggle Buttons */}
                <div className="mt-4 pt-3 border-t border-[#EBC69F]/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#392D35]">Execution Status:</span>
                    <span
                      className={`font-bold capitalize ${
                        currentStatus === 'completed'
                          ? 'text-[#2D5A27]'
                          : currentStatus === 'in_progress'
                          ? 'text-[#8C6819]'
                          : 'text-[#8C2A2A]'
                      }`}
                    >
                      {currentStatus.replace('_', ' ')}
                      {isSaving && '...'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleActionStatusChange(act.id, 'pending')}
                      className={`rounded-lg py-1.5 transition text-center ${
                        currentStatus === 'pending'
                          ? 'bg-[#B83838] text-white shadow-xs'
                          : 'bg-white text-[#494269] border border-[#EBC69F] hover:bg-[#FAF2DF]'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionStatusChange(act.id, 'in_progress')}
                      className={`rounded-lg py-1.5 transition text-center ${
                        currentStatus === 'in_progress'
                          ? 'bg-[#E6B95F] text-[#291C2E] shadow-xs'
                          : 'bg-white text-[#494269] border border-[#EBC69F] hover:bg-[#FAF2DF]'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionStatusChange(act.id, 'completed')}
                      className={`rounded-lg py-1.5 transition text-center ${
                        currentStatus === 'completed'
                          ? 'bg-[#43823C] text-white shadow-xs'
                          : 'bg-white text-[#494269] border border-[#EBC69F] hover:bg-[#FAF2DF]'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
