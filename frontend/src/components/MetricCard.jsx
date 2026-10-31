import Card from './Card'

// Display a label, precise value, and supporting text.
export default function MetricCard({ label, value, subtitle = '' }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </Card>
  )
}
