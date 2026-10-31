import Card from './Card'

// Show the four confusion-matrix results.
export default function ConfusionMatrix({ matrix }) {
  const trueNegative = matrix?.[0]?.[0]
  const falsePositive = matrix?.[0]?.[1]
  const falseNegative = matrix?.[1]?.[0]
  const truePositive = matrix?.[1]?.[1]
  const churnedCustomers = Number(falseNegative) + Number(truePositive)

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Confusion matrix</h2>
      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 text-center">
        <div className="border-b border-r border-slate-200 p-3" />
        <div className="border-b border-r border-slate-200 p-3 text-xs font-medium text-slate-500">Predicted: Stayed</div>
        <div className="border-b border-slate-200 p-3 text-xs font-medium text-slate-500">Predicted: Churned</div>
        <div className="border-b border-r border-slate-200 p-3 text-left text-xs font-medium text-slate-500">Actual: Stayed</div>
        <div className="border-b border-r border-slate-200 p-3">
          <p className="font-mono text-2xl font-semibold text-slate-900">{trueNegative ?? '—'}</p>
          <p className="text-xs text-slate-500">True negative</p>
        </div>
        <div className="border-b border-slate-200 p-3">
          <p className="font-mono text-2xl font-semibold text-slate-900">{falsePositive ?? '—'}</p>
          <p className="text-xs text-slate-500">False positive</p>
        </div>
        <div className="border-r border-slate-200 p-3 text-left text-xs font-medium text-slate-500">Actual: Churned</div>
        <div className="border-r border-slate-200 p-3">
          <p className="font-mono text-2xl font-semibold text-slate-900">{falseNegative ?? '—'}</p>
          <p className="text-xs text-slate-500">False negative</p>
        </div>
        <div className="p-3">
          <p className="font-mono text-2xl font-semibold text-slate-900">{truePositive ?? '—'}</p>
          <p className="text-xs text-slate-500">True positive</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Catches {truePositive ?? '—'} of {churnedCustomers} customers who churned; {falsePositive ?? '—'} false alarms.
      </p>
    </Card>
  )
}
