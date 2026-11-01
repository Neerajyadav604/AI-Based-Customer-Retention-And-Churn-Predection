import { useEffect, useState } from 'react'
import { getLatestPredictions } from '../api'
import DataTable from '../components/DataTable'
import ErrorMessage from '../components/ErrorMessage'
import PageHeader from '../components/PageHeader'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'

// Show every customer from the latest uploaded prediction run.
export default function Predictions() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPredictions() {
      try {
        const data = await getLatestPredictions()
        setCustomers(Array.isArray(data) ? data : [])
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadPredictions()
  }, [])

  if (loading) return <Spinner label="Loading customer predictions..." />
  if (error) return <ErrorMessage message={error} />

  return (
    <section>
      <PageHeader title="Full prediction sheet" description="Every customer from your latest uploaded prediction run, sorted by churn probability." />
      <DataTable
        columns={[
          { key: 'customer_id', label: 'Customer' },
          { key: 'recency_days', label: 'Recency', numeric: true },
          { key: 'frequency', label: 'Orders', numeric: true },
          { key: 'monetary', label: 'Spend', numeric: true, render: (row) => Number(row.monetary).toFixed(2) },
          { key: 'tenure_days', label: 'Tenure', numeric: true },
          { key: 'total_items', label: 'Items', numeric: true },
          { key: 'churn_probability', label: 'Probability', numeric: true, render: (row) => `${(Number(row.churn_probability) * 100).toFixed(1)}%` },
          { key: 'risk_level', label: 'Risk', render: (row) => <RiskBadge riskLevel={row.risk_level} /> },
        ]}
        rows={customers}
        emptyMessage="No customer predictions are available yet."
      />
    </section>
  )
}
