import { useEffect, useState } from 'react'
import { getInsights } from '../api'
import Card from '../components/Card'
import ConfusionMatrix from '../components/ConfusionMatrix'
import ErrorMessage from '../components/ErrorMessage'
import FeatureChart from '../components/FeatureChart'
import MetricCard from '../components/MetricCard'
import ModelComparison from '../components/ModelComparison'
import Spinner from '../components/Spinner'
import { DoodleSparkle } from '../components/Doodles'

const metricNames = [
  ['accuracy', 'Accuracy'],
  ['precision', 'Precision'],
  ['recall', 'Recall'],
  ['f1', 'F1-Score'],
  ['roc_auc', 'ROC-AUC'],
]

export default function ModelInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInsights() {
      try {
        setData(await getInsights())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadInsights()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner label="Loading model diagnostics & telemetry..." />
      </div>
    )
  }

  if (error) return <ErrorMessage message={error} />
  if (!data?.metrics) return <Card>No model insight data is available.</Card>

  const { metrics } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Machine Learning Diagnostics
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Scikit-Learn Pipeline
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Model Performance & Explainability
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Logistic Regression benchmarked on held-out test data (Threshold: {metrics.threshold}).
          </p>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricNames.map(([key, label]) => {
          const val = metrics[key]
          const formatted = typeof val === 'number' ? `${(val * 100).toFixed(1)}%` : val ?? '—'
          return (
            <div
              key={key}
              className="rounded-2xl border border-[#EBC69F]/80 bg-white p-5 shadow-xs card-hover-lift"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#494269]/70">
                {label}
              </p>
              <p className="mt-3 font-mono text-2xl font-bold text-[#291C2E]">
                {formatted}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-[#FFF8ED]">
                <div
                  className="h-full rounded-full bg-[#E6B95F]"
                  style={{ width: typeof val === 'number' ? `${val * 100}%` : '50%' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        <FeatureChart features={data.features} />
        <ConfusionMatrix matrix={metrics.confusion_matrix} />
      </div>

      {/* Model Benchmark Comparison */}
      {data.models && <ModelComparison models={data.models} />}
    </div>
  )
}
