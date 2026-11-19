import { DoodleSparkle } from '../Doodles'

export default function AiDiagnosticInsights() {
  const insights = [
    {
      id: 'penalty',
      title: 'Order Cadence & Single-Purchase Penalty',
      badge: '4.2x multiplier',
      badgeBg: 'bg-[#FAECEC] text-[#8C2A2A] border-[#C87979]/40',
      icon: '⚡',
      iconBg: 'bg-[#FAECEC] text-[#B83838]',
      description:
        'Single-order accounts without repeat booking within 60 days exhibit 4.2x higher churn probability than recurring buyers across all monetary brackets.',
      recommendation: 'Trigger immediate automated second-order incentive campaign within day 21–30.',
    },
    {
      id: 'vulnerability',
      title: 'Early-Tenure Volatility Period (<90 days critical)',
      badge: '<90d critical',
      badgeBg: 'bg-[#FAF2DF] text-[#8C6819] border-[#E6B95F]/40',
      icon: '⏳',
      iconBg: 'bg-[#FAF2DF] text-[#D6A34E]',
      description:
        'Customer defection risk concentrates in the first 90 days of onboarding (avg 34.5% churn probability), stabilizing sharply once lifetime orders exceed 2.',
      recommendation: 'Deploy proactive onboarding check-ins and dedicated customer success touchpoints.',
    },
    {
      id: 'basket',
      title: 'Basket Diversity & Spend Deceleration (+28% risk shift)',
      badge: '+28% risk shift',
      badgeBg: 'bg-[#EAF5E9] text-[#2D5A27] border-[#7EAA79]/40',
      icon: '🛒',
      iconBg: 'bg-[#EAF5E9] text-[#43823C]',
      description:
        'Accounts experiencing declining basket values or single-item transactions exhibit a 28% surge in defection risk compared to multi-item baskets.',
      recommendation: 'Introduce bundled offerings and curated cross-category recommendations.',
    },
  ]

  return (
    <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm flex flex-col justify-between transition-all">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBC69F]/40 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
                AI Diagnostic Insights
              </h3>
              <DoodleSparkle size={18} className="text-[#E6B95F]" />
            </div>
            <p className="text-xs text-[#392D35] mt-0.5">
              SHAP-based predictive inferences surfaced automatically from live customer vectors.
            </p>
          </div>

          <span className="rounded-full bg-[#494269] px-2.5 py-0.5 text-[10px] font-bold text-[#FFF3E4]">
            High Impact
          </span>
        </div>

        {/* Insight Cards */}
        <div className="space-y-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#EBC69F]/60 bg-[#FFF3E4]/80 p-3.5 transition-all hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${item.iconBg}`}>
                    {item.icon}
                  </span>
                  <p className="font-bold text-xs text-[#291C2E]">{item.title}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold shrink-0 ${item.badgeBg}`}>
                  {item.badge}
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#392D35]">
                {item.description}
              </p>

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[#8C6819]">
                <span>💡 Action:</span>
                <span className="text-[#494269]">{item.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#EBC69F]/40 text-xs">
        <span className="text-[#392D35] text-[11px]">
          Correlations calculated over evaluated cohort
        </span>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('feature-importance-section')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          className="font-bold text-[#494269] hover:text-[#8C6819] transition flex items-center gap-1 cursor-pointer"
        >
          <span>SHAP Feature Details</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}

