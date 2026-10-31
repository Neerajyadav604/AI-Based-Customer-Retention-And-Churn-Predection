import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getStats } from '../api'
import MetricCard from '../components/MetricCard'
import PageHeader from '../components/PageHeader'

const cards = [
  ['total_customers', 'Total customers', 'bg-blue-50 text-blue-800'],
  ['high', 'High risk', 'bg-red-50 text-red-800'],
  ['medium', 'Medium risk', 'bg-yellow-50 text-yellow-800'],
  ['low', 'Low risk', 'bg-green-50 text-green-800'],
]

const colours = {
  High: '#dc2626',
  Medium: '#ca8a04',
  Low: '#16a34a',
}

// Load and display the latest customer risk summary.
export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) {
    return <p className="text-slate-600">Loading dashboard...</p>
  }

  if (error) {
    return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>
  }

  const hasData = stats && Number(stats.total_customers) > 0
  const riskData = hasData
    ? [
      { name: 'High', value: stats.high },
      { name: 'Medium', value: stats.medium },
      { name: 'Low', value: stats.low },
    ]
    : []

  return (
    <section>
      <PageHeader title="Dashboard" description="A summary of the latest customer risk results." />
      {!hasData ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No customer data yet</h2>
          <p className="mt-2 text-slate-600">Upload a customer CSV to see your risk summary.</p>
          <Link to="/upload" className="mt-5 inline-block rounded bg-blue-700 px-4 py-2 font-medium text-white">
            Upload customer data
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([name, label]) => (
              <MetricCard key={name} label={label} value={stats[name] ?? 0} subtitle="Latest upload" />
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Risk split</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                      {riskData.map((entry) => <Cell key={entry.name} fill={colours[entry.name]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Customers by risk</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Customers">
                      {riskData.map((entry) => <Cell key={entry.name} fill={colours[entry.name]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
