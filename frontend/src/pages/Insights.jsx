import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getInsights } from '../api'
import PageHeader from '../components/PageHeader'

const meanings = {
  accuracy: 'How often the model gives the correct risk category.',
  precision: 'How often high-risk predictions are actually high risk.',
  recall: 'How many real high-risk customers the model finds.',
  f1: 'A balanced score combining precision and recall.',
  roc_auc: 'How well the model separates customers by risk.',
  threshold: 'The probability cutoff used to mark a customer as high risk.',
}

// Format model values for friendly display.
function formatValue(value, name) {
  return name === 'threshold' ? Number(value).toFixed(2) : `${(Number(value) * 100).toFixed(1)}%`
}

// Load and display model performance information.
export default function Insights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInsights() {
      try {
        setInsights(await getInsights())
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [])

  if (loading) {
    return <p className="text-slate-600">Loading model insights...</p>
  }

  if (error) {
    return <p className="rounded bg-red-50 p-4 text-red-700">{error}</p>
  }

  const metrics = insights?.metrics || {}
  const features = insights?.feature_importance || []

  return (
    <section>
      <PageHeader title="Model insights" description="Understand how the churn model performs and what influences it." />
      <div className="overflow-x-auto rounded-lg bg-white p-4 shadow-sm">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr><th className="px-3 py-3">Metric</th><th className="px-3 py-3">Value</th><th className="px-3 py-3">Meaning</th></tr>
          </thead>
          <tbody>
            {Object.entries(meanings).map(([name, meaning]) => (
              <tr key={name} className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium">{name}</td>
                <td className="px-3 py-3">{metrics[name] === undefined ? '—' : formatValue(metrics[name], name)}</td>
                <td className="px-3 py-3 text-slate-600">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Feature importance</h2>
        {features.length === 0 ? (
          <p className="text-slate-500">No feature importance data is available yet.</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={features} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" width={100} />
                <Tooltip />
                <Bar dataKey="value" name="Importance">
                  {features.map((feature) => <Cell key={feature.feature} fill={Number(feature.value) >= 0 ? '#2563eb' : '#dc2626'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-3 text-sm text-slate-500">Blue values increase predicted churn; red values decrease it.</p>
      </div>
      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <h2 className="text-xl font-semibold">Limitations</h2>
        <p className="mt-2">These results are estimates based on the available customer data. They should support business decisions, not replace your understanding of individual customers.</p>
      </div>
    </section>
  )
}
