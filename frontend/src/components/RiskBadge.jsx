// Show a risk label with its leading status dot.
export default function RiskBadge({ riskLevel }) {
  const styles = {
    Low: 'border-green-200 bg-green-50 text-green-600',
    Medium: 'border-amber-200 bg-amber-50 text-amber-600',
    High: 'border-red-200 bg-red-50 text-red-600',
  }
  const dots = { Low: 'bg-green-600', Medium: 'bg-amber-600', High: 'bg-red-600' }
  const style = styles[riskLevel] || 'border-slate-200 bg-slate-50 text-slate-500'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>
      <span className={`size-1.5 rounded-full ${dots[riskLevel] || 'bg-slate-400'}`} />
      {riskLevel || 'Unknown'}
    </span>
  )
}
