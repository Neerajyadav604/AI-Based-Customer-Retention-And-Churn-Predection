import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getStats } from '../api'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import ErrorMessage from '../components/ErrorMessage'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'
import Icon from '../components/Icon'

const riskColours = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

// Format the upload date in the user's local time.
function formatUploadDate(value) {
  if (!value) return ''
  return `Last upload: ${new Date(value).toLocaleString()}`
}

function OverviewCard({ label, value, detail, colour, icon }) {
  const styles = {
    indigo: 'border-indigo-100 bg-indigo-50/20 text-indigo-600',
    red: 'border-red-100 bg-red-50/20 text-red-600',
    amber: 'border-amber-100 bg-amber-50/20 text-amber-600',
    green: 'border-emerald-100 bg-emerald-50/20 text-emerald-600',
  }
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${styles[colour]}`}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className="grid size-7 place-items-center rounded-lg bg-white/80"><Icon name={icon} size={14} /></span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] text-slate-500">{detail}</p>
    </div>
  )
}

// Load and display the latest upload summary.
export default function Dashboard() {
  const location = useLocation()
  const [showGettingStarted, setShowGettingStarted] = useState(location.state?.gettingStarted !== false)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setStats(await getStats())
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) return <Spinner label="Loading dashboard..." />
  if (error) return <ErrorMessage message={error} />

  const hasData = Number(stats?.total_customers) > 0
  const description = ['Summary of your latest upload', formatUploadDate(stats?.last_upload_at)]
    .filter(Boolean)
    .join(' · ')

  if (!hasData) {
    return (
      <section className="mx-auto max-w-6xl">
        <OverviewHeader description={description} />
        {showGettingStarted && (
          <Card className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold text-slate-900">Getting started</h2><p className="mt-1 text-sm text-slate-500">A simple path to your first retention insight.</p></div>
              <button type="button" onClick={() => setShowGettingStarted(false)} className="text-sm text-slate-400 hover:text-slate-700" aria-label="Dismiss getting started card">Dismiss</button>
            </div>
            <ol className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li><span className="font-mono text-indigo-600">1.</span> Upload data</li>
              <li><span className="font-mono text-indigo-600">2.</span> Run a prediction</li>
              <li><span className="font-mono text-indigo-600">3.</span> View recommendations</li>
            </ol>
          </Card>
        )}
        <Card className="rounded-2xl border-slate-200 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <h2 className="text-xl font-semibold text-slate-900">No data yet</h2>
          <p className="mt-2 text-sm text-slate-500">Upload a CSV to see customer risk results.</p>
          <Link to="/workspace/upload" className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
            Upload your first CSV
          </Link>
        </Card>
      </section>
    )
  }

  const riskData = [
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low },
  ]

  const columns = [
    { key: 'customer_id', label: 'Customer' },
    { key: 'recency_days', label: 'Recency', numeric: true },
    { key: 'frequency', label: 'Orders', numeric: true },
    { key: 'monetary', label: 'Spend', numeric: true, render: (row) => row.monetary.toFixed(2) },
    { key: 'churn_probability', label: 'Probability', numeric: true, render: (row) => `${(row.churn_probability * 100).toFixed(1)}%` },
    { key: 'risk_level', label: 'Risk', render: (row) => <RiskBadge riskLevel={row.risk_level} /> },
  ]

  return (
    <section className="mx-auto max-w-6xl">
      <OverviewHeader description={description} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard label="Total customers" value={stats.total_customers} detail="Latest upload" colour="indigo" icon="overview" />
        <OverviewCard label="High risk" value={stats.high} detail="Requires retention outreach" colour="red" icon="predict" />
        <OverviewCard label="Medium risk" value={stats.medium} detail="Monitor spend velocity" colour="amber" icon="insights" />
        <OverviewCard label="Retained (low)" value={stats.low} detail="Healthy retention profile" colour="green" icon="recommendations" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.5fr]">
        <Card className="rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between">
            <div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">Risk overview</p><h2 className="mt-1 text-sm font-bold text-slate-900">Customer risk distribution</h2></div>
            <span className="rounded-full bg-indigo-50 px-2 py-1 font-mono text-[10px] text-indigo-600">{(stats.avg_probability * 100).toFixed(1)}% avg.</span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                  {riskData.map((item) => <Cell key={item.name} fill={riskColours[item.name]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
            {riskData.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: riskColours[item.name] }} />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500">Average churn probability <span className="font-mono font-semibold text-slate-700">{(stats.avg_probability * 100).toFixed(1)}%</span></p>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">Priority queue</p><h2 className="mt-1 text-sm font-bold text-slate-900">Needs attention</h2></div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/workspace/predictions" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">View full sheet →</Link>
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 [&_table]:min-w-0 [&_th]:px-3 [&_td]:px-3 [&_th]:text-[9px] [&_td]:text-[11px]">
            <DataTable columns={columns} rows={stats.top_customers || []} emptyMessage="No customers need attention." />
          </div>
        </Card>
      </div>
      <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3 text-xs text-slate-600"><span className="mr-2 text-indigo-600">✦</span>Model status: Logistic Regression is active. Results are based on the latest uploaded customer activity.</div>
    </section>
  )
}

function OverviewHeader({ description }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400"><span className="size-1.5 rounded-full bg-slate-400" /> Workspace <span>/</span> <span className="text-slate-700">Overview</span></div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-2 text-sm text-slate-500">{description || 'Monitor customer churn risk and retention opportunities.'}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wide text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" />AI model active</span>
        <Link to="/workspace/upload" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">Upload data →</Link>
      </div>
    </div>
  )
}
