// Show churn probability as a horizontal progress bar.
export default function ProbabilityBar({ probability }) {
  const percentage = Math.min(Math.max(Number(probability) * 100, 0), 100)

  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-sm text-slate-600">
        <span>Churn probability</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200" aria-label={`${percentage.toFixed(1)}% churn probability`}>
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
