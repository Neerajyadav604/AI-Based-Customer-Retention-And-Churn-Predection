import { DoodleSparkle } from '../Doodles'

const cohorts = [
  { level: 'High Risk', count: '92', pct: 30, desc: 'Immediate intervention needed. Order frequency dropped > 50%.', col: 'bg-[#B83838]' },
  { level: 'Medium Risk', count: '82', pct: 27, desc: 'Approaching usual order cycle deadline. Early nurture advised.', col: 'bg-[#E6B95F]' },
  { level: 'Low Risk', count: '126', pct: 43, desc: 'Healthy, stable reordering velocity with consistent basket size.', col: 'bg-[#43823C]' },
]

export default function RiskOverview() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#291C2E] mb-3">
          <DoodleSparkle size={14} className="text-[#E6B95F]" />
          <span>Customer Risk Telemetry</span>
        </div>
        <h2 className="font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
          Turn scattered order histories into prioritized follow-ups.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#392D35]">
          Rather than treating all customers uniformly, ChurnGuard segregates your accounts based on mathematical defection probability so you know where your marketing rupees yield highest return.
        </p>

        <ul className="mt-8 space-y-4 text-sm text-[#291C2E]">
          {[
            'Instant cohort filtering across High, Medium, and Low risk bands',
            'Feature attribution explaining exactly which factors drive individual churn',
            'Full upload run histories with exportable CSVs for WhatsApp or email flows',
          ].map((text) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#E6B95F] text-[#291C2E] text-xs font-bold">
                ✓
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border-2 border-[#EBC69F] bg-white p-7 shadow-[0_12px_40px_rgba(73,66,105,0.08)]">
        <div className="flex items-center justify-between border-b border-[#EBC69F]/50 pb-4">
          <div>
            <p className="font-editorial text-lg font-bold text-[#291C2E]">Risk Distribution Analysis</p>
            <p className="text-xs text-[#392D35]">300 Evaluated Accounts Sample</p>
          </div>
          <span className="rounded-full bg-[#FFF8ED] px-3 py-1 text-xs font-semibold text-[#291C2E] border border-[#EBC69F]">
            Interactive Cohort
          </span>
        </div>

        <div className="mt-6 space-y-6">
          {cohorts.map((c) => (
            <div key={c.level} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#291C2E]">{c.level}</span>
                <span className="font-mono text-[#373152]">{c.count} accounts ({c.pct}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#FFF8ED] overflow-hidden">
                <div className={`h-full rounded-full ${c.col}`} style={{ width: `${c.pct * 2}%` }} />
              </div>
              <p className="text-[11px] text-[#392D35]">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
