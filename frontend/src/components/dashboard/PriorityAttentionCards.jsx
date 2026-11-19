import RiskBadge from '../RiskBadge'
import { DoodleAvatar, DoodleSparkle } from '../Doodles'
import { getRiskLevel, normalizeProbability, explainCustomerRisk, RISK_PALETTE } from '../../utils/risk'

export default function PriorityAttentionCards({ customers, onSelectCustomer }) {
  // Sort by churn probability descending and filter for accounts needing attention (prob > 30% or top 3)
  const attentionCandidates = customers
    .map((c) => ({
      ...c,
      normalizedProb: normalizeProbability(c.churn_probability),
      risk: getRiskLevel(c.churn_probability),
    }))
    .sort((a, b) => b.normalizedProb - a.normalizedProb)

  const attentionList = attentionCandidates.filter((c) => c.risk === 'High' || c.risk === 'Medium')
  const displayList = attentionList.length > 0 ? attentionList.slice(0, 3) : attentionCandidates.slice(0, 3)

  return (
    <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBC69F]/40 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-2xl font-bold text-[#291C2E]">
              Customers Who Need Attention
            </h3>
            <span className="text-[#E6B95F] text-lg font-bold">✦</span>
          </div>
          <p className="text-xs text-[#392D35] mt-0.5">
            Ranked accounts with elevated defection indicators requiring immediate retention intervention.
          </p>
        </div>
        <span className="rounded-full bg-[#FAF2DF] px-3 py-1 text-xs font-bold text-[#8C6819] border border-[#E6B95F]/50">
          {attentionList.length} Accounts in Focus
        </span>
      </div>

      {displayList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayList.map((c, i) => {
            const prob = c.normalizedProb
            const risk = c.risk
            const colors = RISK_PALETTE[risk] || RISK_PALETTE.Low
            const { reasons, playbook } = explainCustomerRisk(c)

            return (
              <div
                key={c.customer_id || i}
                className="rounded-3xl border border-[#EBC69F]/80 bg-[#FFF3E4] p-5 shadow-sm transition hover:shadow-md hover:border-[#494269]/40 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-[#EBC69F]/50 pb-3">
                    <div className="flex items-center gap-2.5">
                      <DoodleAvatar id={Number(String(c.customer_id).replace(/\D/g, '')) || (i + 1)} size={36} />
                      <div>
                        <p className="font-mono text-sm font-bold text-[#291C2E]">
                          #{c.customer_id}
                        </p>
                        <p className="text-[10px] text-[#A99BB9]">Evaluated Account</p>
                      </div>
                    </div>
                    <RiskBadge riskLevel={risk} size="sm" />
                  </div>

                  {/* Churn Probability Banner */}
                  <div className="my-4 rounded-2xl bg-white p-3.5 border border-[#EBC69F]/60">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#494269]/80 uppercase text-[10px] tracking-wider">
                        Churn Probability
                      </span>
                      <span className="font-mono text-base font-extrabold text-[#291C2E]">
                        {prob.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-full bg-[#FAF2DF] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${prob}%`,
                          backgroundColor: colors.bar,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick RFM Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-white/70 p-2 border border-[#EBC69F]/40">
                      <p className="text-[10px] text-[#A99BB9]">Recency</p>
                      <p className="font-mono font-bold text-[#291C2E] mt-0.5">{c.recency_days ?? 0}d</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-2 border border-[#EBC69F]/40">
                      <p className="text-[10px] text-[#A99BB9]">Orders</p>
                      <p className="font-mono font-bold text-[#291C2E] mt-0.5">{c.frequency ?? 1}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-2 border border-[#EBC69F]/40">
                      <p className="text-[10px] text-[#A99BB9]">Spend</p>
                      <p className="font-mono font-bold text-[#291C2E] mt-0.5">₹{Number(c.monetary || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Why this customer is at risk */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#494269]">
                      Why at risk:
                    </p>
                    <ul className="space-y-1 text-[#392D35] text-[11px]">
                      {reasons.slice(0, 2).map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#E6B95F] font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action */}
                  <div className="mt-3 rounded-xl bg-[#FAF2DF]/70 p-2.5 text-[11px] text-[#291C2E] border border-[#E6B95F]/30">
                    <span className="font-bold text-[#8C6819]">Action: </span>
                    <span>{playbook}</span>
                  </div>
                </div>

                {/* View Details interaction */}
                <button
                  type="button"
                  onClick={() => onSelectCustomer?.(c)}
                  className="mt-4 w-full rounded-2xl border border-[#494269] bg-white py-2 text-xs font-semibold text-[#494269] hover:bg-[#494269] hover:text-[#FFF3E4] transition shadow-2xs"
                >
                  View Details & Deep Audit →
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#EBC69F] bg-[#FAF2DF]/40 p-8 text-center text-xs text-[#392D35]">
          No high or moderate churn risk customers in the current evaluated cohort. All accounts are within safe retention bounds!
        </div>
      )}
    </div>
  )
}

