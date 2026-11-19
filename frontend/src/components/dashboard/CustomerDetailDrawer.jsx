import { useEffect } from 'react'
import RiskBadge from '../RiskBadge'
import { DoodleAvatar, DoodleSparkle } from '../Doodles'
import { getRiskLevel, normalizeProbability, explainCustomerRisk, RISK_PALETTE } from '../../utils/risk'

export default function CustomerDetailDrawer({ customer, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!customer) return null

  const prob = normalizeProbability(customer.churn_probability)
  const risk = getRiskLevel(customer.churn_probability)
  const colors = RISK_PALETTE[risk] || RISK_PALETTE.Low
  const { reasons, shields, playbook } = explainCustomerRisk(customer)

  const avgOrder = customer.avg_order_value || (Number(customer.monetary || 0) / Math.max(1, Number(customer.frequency || 1)))

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#291C2E]/40 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close drawer backdrop" />

      {/* Drawer content panel */}
      <div className="relative z-10 w-full max-w-lg overflow-y-auto bg-[#FFF3E4] p-6 shadow-2xl border-l border-[#EBC69F] sm:p-8 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#EBC69F]/60 pb-5">
            <div className="flex items-center gap-3">
              <DoodleAvatar id={Number(String(customer.customer_id).replace(/\D/g, '')) || 1} size={48} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-xl font-bold text-[#291C2E]">
                    Account #{customer.customer_id}
                  </h2>
                  <RiskBadge riskLevel={risk} size="sm" />
                </div>
                <p className="text-xs text-[#392D35] mt-0.5">Individual Account Retention Audit</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-xl border border-[#EBC69F] bg-white text-[#494269] hover:bg-[#FAF2DF] transition shadow-xs"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          {/* Churn Probability Gauge Card */}
          <div className="mt-6 rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#494269]/70">
                  Defection Probability
                </span>
                <p className="font-mono text-3xl font-extrabold text-[#291C2E] mt-1">
                  {prob.toFixed(1)}%
                </p>
              </div>
              <div
                className="size-14 rounded-full flex flex-col items-center justify-center font-mono text-xs font-bold border-2"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <span>{risk}</span>
                <span className="text-[9px] font-normal uppercase">Risk</span>
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div className="mt-4">
              <div className="h-2.5 w-full rounded-full bg-[#FAF2DF] overflow-hidden p-0.5 border border-[#EBC69F]/50">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${prob}%`,
                    backgroundColor: colors.bar,
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[#A99BB9]">
                <span>0% (Safe)</span>
                <span>30%</span>
                <span>60%</span>
                <span>100% (Defecting)</span>
              </div>
            </div>
          </div>

          {/* Behavioral Feature Metrics Grid */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#494269] mb-3">
              Behavioral Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5">
                <p className="text-[10px] text-[#A99BB9] uppercase font-bold">Recency</p>
                <p className="font-mono text-lg font-bold text-[#291C2E] mt-1">
                  {customer.recency_days ?? 0} <span className="text-xs font-sans text-[#392D35]">days</span>
                </p>
              </div>
              <div className="rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5">
                <p className="text-[10px] text-[#A99BB9] uppercase font-bold">Orders</p>
                <p className="font-mono text-lg font-bold text-[#291C2E] mt-1">
                  {customer.frequency ?? 1}
                </p>
              </div>
              <div className="rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5">
                <p className="text-[10px] text-[#A99BB9] uppercase font-bold">Total Spend</p>
                <p className="font-mono text-lg font-bold text-[#291C2E] mt-1">
                  ₹{Number(customer.monetary || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5">
                <p className="text-[10px] text-[#A99BB9] uppercase font-bold">Avg Basket</p>
                <p className="font-mono text-lg font-bold text-[#291C2E] mt-1">
                  ₹{avgOrder.toFixed(0)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5">
                <p className="text-[10px] text-[#A99BB9] uppercase font-bold">Tenure</p>
                <p className="font-mono text-lg font-bold text-[#291C2E] mt-1">
                  {customer.tenure_days ?? 0} <span className="text-xs font-sans text-[#392D35]">days</span>
                </p>
              </div>
              <div className="rounded-2xl border border-[#EBC69F]/70 bg-white p-3.5">
                <p className="text-[10px] text-[#A99BB9] uppercase font-bold">Total Items</p>
                <p className="font-mono text-lg font-bold text-[#291C2E] mt-1">
                  {customer.total_items ?? 1}
                </p>
              </div>
            </div>
          </div>

          {/* AI Explainability Factors */}
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#C87979]/40 bg-[#FAECEC]/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C2A2A] mb-2">
                <span>▲</span>
                <span>Factors Increasing Churn Risk</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#291C2E]">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#B83838] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {shields.length > 0 && (
              <div className="rounded-2xl border border-[#7EAA79]/40 bg-[#EAF5E9]/50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D5A27] mb-2">
                  <span>▼</span>
                  <span>Retention Protective Factors</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#291C2E]">
                  {shields.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#43823C] font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actionable Playbook Recommendation */}
          <div className="mt-6 rounded-2xl border border-[#E6B95F] bg-[#FAF2DF] p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C6819] mb-1.5">
              <DoodleSparkle size={16} className="text-[#E6B95F]" />
              <span className="uppercase tracking-wider">Recommended Playbook Action</span>
            </div>
            <p className="text-xs leading-relaxed text-[#291C2E] font-medium">
              {playbook}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-[#EBC69F]/60 flex items-center justify-between">
          <span className="text-xs text-[#A99BB9]">AI Risk Decomposition</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#494269] px-5 py-2.5 text-xs font-semibold text-[#FFF3E4] hover:bg-[#373152] transition shadow-xs"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  )
}

