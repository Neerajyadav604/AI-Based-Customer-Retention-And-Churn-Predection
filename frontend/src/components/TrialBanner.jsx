import { usePlan } from '../context/PlanContext'

// Warn when the user is on their last free prediction.
export default function TrialBanner() {
  const { planInfo } = usePlan()
  if (!planInfo || planInfo.plan !== 'trial' || planInfo.trials_left !== 1) return null

  return (
    <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Last free trial left.
    </p>
  )
}
