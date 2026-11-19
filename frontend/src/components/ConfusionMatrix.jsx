import Card from './Card'
import { DoodleSparkle } from './Doodles'

export default function ConfusionMatrix({ matrix }) {
  const trueNegative = matrix?.[0]?.[0]
  const falsePositive = matrix?.[0]?.[1]
  const falseNegative = matrix?.[1]?.[0]
  const truePositive = matrix?.[1]?.[1]
  const totalChurned = Number(falseNegative || 0) + Number(truePositive || 0)

  return (
    <Card className="rounded-3xl border-[#EBC69F]">
      <div className="flex items-center justify-between border-b border-[#EBC69F]/50 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">
              Confusion Matrix Evaluation
            </h2>
            <DoodleSparkle size={18} className="text-[#E6B95F]" />
          </div>
          <p className="mt-1 text-xs text-[#392D35]">
            Classification accuracy evaluated against the held-out test cohort.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border-2 border-[#EBC69F]/80 text-center shadow-xs">
        {/* Header row */}
        <div className="border-b-2 border-r-2 border-[#EBC69F]/80 bg-[#FFF8ED] p-3 text-xs font-bold text-[#494269]" />
        <div className="border-b-2 border-r-2 border-[#EBC69F]/80 bg-[#FFF8ED] p-3 text-xs font-bold uppercase tracking-wider text-[#494269]">
          Predicted: Stayed
        </div>
        <div className="border-b-2 border-[#EBC69F]/80 bg-[#FFF8ED] p-3 text-xs font-bold uppercase tracking-wider text-[#494269]">
          Predicted: Churned
        </div>

        {/* Row 1: Actual Stayed */}
        <div className="border-b-2 border-r-2 border-[#EBC69F]/80 bg-[#FFF8ED]/80 p-4 text-left text-xs font-bold text-[#494269]">
          Actual: Stayed
        </div>
        <div className="border-b-2 border-r-2 border-[#EBC69F]/80 bg-[#EAF5E9]/50 p-4">
          <p className="font-mono text-3xl font-bold text-[#2D5A27]">
            {trueNegative ?? '—'}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#43823C] mt-1">
            True Negative (Correct)
          </p>
        </div>
        <div className="border-b-2 border-[#EBC69F]/80 bg-[#FAF2DF]/50 p-4">
          <p className="font-mono text-3xl font-bold text-[#8C6819]">
            {falsePositive ?? '—'}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#D6A34E] mt-1">
            False Positive (Type I)
          </p>
        </div>

        {/* Row 2: Actual Churned */}
        <div className="border-r-2 border-[#EBC69F]/80 bg-[#FFF8ED]/80 p-4 text-left text-xs font-bold text-[#494269]">
          Actual: Churned
        </div>
        <div className="border-r-2 border-[#EBC69F]/80 bg-[#FAECEC]/50 p-4">
          <p className="font-mono text-3xl font-bold text-[#8C2A2A]">
            {falseNegative ?? '—'}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#B83838] mt-1">
            False Negative (Missed)
          </p>
        </div>
        <div className="bg-[#EAF5E9]/50 p-4">
          <p className="font-mono text-3xl font-bold text-[#2D5A27]">
            {truePositive ?? '—'}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#43823C] mt-1">
            True Positive (Captured)
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#FFF8ED] p-4 text-xs text-[#291C2E] border border-[#EBC69F]/60 flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#494269] text-[#E6B95F] font-bold">
          ✓
        </span>
        <p>
          Successfully identifies{' '}
          <strong className="text-[#2D5A27]">{truePositive ?? '—'}</strong> out of{' '}
          <strong>{totalChurned}</strong> genuine churn cases, keeping false interventions minimal.
        </p>
      </div>
    </Card>
  )
}
