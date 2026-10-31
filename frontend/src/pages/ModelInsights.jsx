import { useEffect, useState } from 'react'
import { getInsights } from '../api'
import Card from '../components/Card'
import ConfusionMatrix from '../components/ConfusionMatrix'
import ErrorMessage from '../components/ErrorMessage'
import FeatureChart from '../components/FeatureChart'
import MetricCard from '../components/MetricCard'
import ModelComparison from '../components/ModelComparison'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

const metricNames = [
  ['accuracy', 'Accuracy'],
  ['precision', 'Precision'],
  ['recall', 'Recall'],
  ['f1', 'F1'],
  ['roc_auc', 'ROC-AUC'],
]

// Load and display model performance details.
export default function ModelInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInsights() {
      try {
        setData(await getInsights())
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [])

  if (loading) return <Spinner label="Loading model insights..." />
  if (error) return <ErrorMessage message={error} />
  if (!data?.metrics) return <Card>No model insight data is available.</Card>

  const { metrics } = data
  const description = `Logistic Regression, threshold ${metrics.threshold}, evaluated on a held-out test set`

  return (
    <section>
      <PageHeader title="Model Insights" description={description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricNames.map(([name, label]) => <MetricCard key={name} label={label} value={Number(metrics[name]).toFixed(3)} />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ConfusionMatrix matrix={data.confusion_matrix} />
        <FeatureChart features={data.feature_importance} />
      </div>
      <ModelComparison models={data.models} />
      <Card className="mt-6 border-amber-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-amber-900">Limitations</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-amber-900">
          <li>Trained on a public UK online-retail dataset, not on Indian kirana stores.</li>
          <li>A modest baseline (ROC-AUC about 0.72), better than guessing but not highly accurate.</li>
          <li>Churn here means no order in the 90 days after a cutoff date.</li>
        </ul>
      </Card>
    </section>
  )
}
