import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../api'
import { recommendationInfo } from '../data/recommendations'
import Card from '../components/Card'
import ErrorMessage from '../components/ErrorMessage'
import RiskBadge from '../components/RiskBadge'
import Spinner from '../components/Spinner'
import { DoodleSparkle } from '../components/Doodles'

const cohortTheme = {
  High: {
    bg: 'bg-[#FAECEC]/60',
    border: 'border-[#C87979]',
    badge: 'High Risk Cohort',
    accent: 'text-[#8C2A2A]',
    chip: 'bg-[#B83838]',
  },
  Medium: {
    bg: 'bg-[#FAF2DF]/60',
    border: 'border-[#E6B95F]',
    badge: 'Watchlist Cohort',
    accent: 'text-[#8C6819]',
    chip: 'bg-[#E6B95F]',
  },
  Low: {
    bg: 'bg-[#EAF5E9]/60',
    border: 'border-[#7EAA79]',
    badge: 'Healthy Recurring',
    accent: 'text-[#2D5A27]',
    chip: 'bg-[#43823C]',
  },
}

export default function Recommendations() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        setStats(await getStats())
      } catch (err) {
        setError(err.message)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBC69F]/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#494269]/70">
              Retention Playbooks
            </span>
            <span className="rounded-full bg-[#EBC69F]/40 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              Action Guides
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
              Prescriptive Action Strategies
            </h1>
            <DoodleSparkle size={20} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1.5 text-sm text-[#392D35]">
            Proven tactical playbooks to re-engage slipping accounts and maximize lifetime customer value.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* 3 Playbook Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(recommendationInfo).map(([level, item]) => {
          const t = cohortTheme[level] || cohortTheme.Medium
          return (
            <Card
              key={level}
              className={`rounded-3xl border-2 ${t.border} ${t.bg} p-7 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <RiskBadge riskLevel={level} size="md" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#494269]">
                    {t.badge}
                  </span>
                </div>

                <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">
                  {item.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#392D35]">
                  <strong>Cohort Behavior:</strong> {item.meaning}
                </p>

                <div className="mt-6 border-t border-[#EBC69F]/50 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#494269] mb-3">
                    Recommended Actions
                  </p>
                  <ul className="space-y-3 text-xs text-[#291C2E]">
                    {item.actions.map((act) => (
                      <li key={act} className="flex items-start gap-2.5">
                        <span className={`size-1.5 rounded-full mt-1.5 shrink-0 ${t.chip}`} />
                        <span className="leading-relaxed">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EBC69F]/40 flex items-center justify-between text-xs text-[#494269]">
                <span>Target Channel</span>
                <span className="font-semibold text-[#291C2E]">Email / WhatsApp / SMS</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Live Account Counts */}
      {stats?.total_customers > 0 && (
        <Card className="rounded-3xl border border-[#EBC69F] bg-white p-7">
          <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
            Current Cohort Population Breakdown
          </h3>
          <p className="mt-2 text-xs text-[#392D35]">
            From your most recent uploaded dataset: you have{' '}
            <strong className="text-[#8C2A2A]">{stats.high} High Risk</strong> accounts requiring rescue outreach,{' '}
            <strong className="text-[#8C6819]">{stats.medium} Medium Risk</strong> accounts to nurture, and{' '}
            <strong className="text-[#2D5A27]">{stats.low} Low Risk</strong> stable accounts.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              to="/workspace/predictions"
              className="rounded-xl bg-[#494269] px-4 py-2 text-xs font-semibold text-[#FFF3E4] hover:bg-[#373152] transition"
            >
              Open Full Prediction Sheet →
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
