import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getStats } from '../api'
import Card from '../components/Card'
import DataTable from '../components/DataTable'
import ErrorMessage from '../components/ErrorMessage'
import MetricCard from '../components/MetricCard'
import PageHeader from '../components/PageHeader'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'

const riskColours = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

// Format the upload date in the user's local time.
function formatUploadDate(value) {
  if (!value) return ''
  return `Last upload: ${new Date(value).toLocaleString()}`
}

// Load and display the latest upload summary.
export default function Dashboard() {
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
      <section>
        <PageHeader title="Dashboard" description={description} />
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">No data yet</h2>
          <p className="mt-2 text-sm text-slate-500">Upload a CSV to see customer risk results.</p>
          <Link to="/upload" className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
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
    <section>
      <PageHeader title="Dashboard" description={description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total customers" value={stats.total_customers} subtitle="Latest upload" />
        <MetricCard label="High risk" value={stats.high} subtitle="Latest upload" />
        <MetricCard label="Medium risk" value={stats.medium} subtitle="Latest upload" />
        <MetricCard label="Low risk" value={stats.low} subtitle="Latest upload" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Risk distribution</h2>
          <div className="mt-4 h-64">
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
          <p className="text-center text-sm text-slate-500">Average churn probability: <span className="font-mono">{(stats.avg_probability * 100).toFixed(1)}%</span></p>
        </Card>
        <Card>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Needs attention</h2>
            <Link to="/upload" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600">Upload new data</Link>
          </div>
          <div className="mt-4 [&_table]:min-w-0 [&_th]:px-2 [&_td]:px-2">
            <DataTable columns={columns} rows={stats.top_customers || []} emptyMessage="No customers need attention." />
          </div>
        </Card>
      </div>
    </section>
  )
}
