import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../api'
import { recommendationInfo } from '../data/recommendations'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import PageHeader from '../components/PageHeader'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'

const cardStyles = { High: 'border-red-200 bg-red-50', Medium: 'border-amber-200 bg-amber-50', Low: 'border-green-200 bg-green-50' }

// Show simple retention ideas for each risk level.
export default function Recommendations() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        setStats(await getStats())
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    loadStats()
  }, [])

  return (
    <section>
      <PageHeader title="Retention recommendations" description="Simple actions for each customer risk level." />
      {error && <ErrorMessage message={error} />}
      <div className="grid gap-5 md:grid-cols-3">
        {Object.entries(recommendationInfo).map(([level, item]) => (
          <Card key={level} className={cardStyles[level]}>
            <RiskBadge riskLevel={level} />
            <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{level}: {item.meaning}</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-slate-700">
              {item.actions.map((action) => <li key={action}>{action}</li>)}
            </ul>
          </Card>
        ))}
      </div>
      {!stats && !error && <div className="mt-6 text-slate-500"><Spinner label="Loading customer counts..." /></div>}
      {stats?.total_customers > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Your latest upload</h2>
          <p className="mt-2 text-slate-600">You have {stats.high} High risk customers, {stats.medium} Medium risk customers, and {stats.low} Low risk customers.</p>
        </Card>
      )}
      {stats?.total_customers === 0 && (
        <Card className="mt-6">
          <p className="text-slate-600">No customer data yet.</p>
          <Link to="/workspace/upload" className="mt-3 inline-block font-medium text-indigo-600 hover:text-indigo-700">Upload your first CSV</Link>
        </Card>
      )}
    </section>
  )
}
