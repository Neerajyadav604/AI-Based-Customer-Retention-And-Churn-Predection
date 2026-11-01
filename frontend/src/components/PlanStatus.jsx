import { Link } from 'react-router-dom'
import { usePlan } from '../context/PlanContext'

// Compact plan widget for the bottom of the workspace sidebar.
export default function PlanStatus() {
  const { planInfo } = usePlan()
  if (!planInfo) return null

  if (planInfo.plan === 'pro' || planInfo.plan === 'business') {
    const label = planInfo.plan === 'pro' ? 'Pro' : 'Business'
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Current plan</p>
        <span className="mt-1 inline-flex rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-200">{label}</span>
      </div>
    )
  }

  const left = planInfo.trials_left ?? 0
  const percent = Math.max(0, Math.min(100, (left / 3) * 100))

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-medium text-white">Trial: {left} of 3 left</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-blue-400" style={{ width: `${percent}%` }} />
      </div>
      <Link to="/pricing" className="mt-3 inline-flex rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-500">Upgrade</Link>
    </div>
  )
}
