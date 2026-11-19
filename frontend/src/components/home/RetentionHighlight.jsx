import { DoodleSparkle } from '../Doodles'

const actions = [
  {
    num: '01',
    title: 'Detect Drop-Off Patterns',
    text: 'Identifies non-linear purchase gap intervals instead of simple static calendar thresholds.',
  },
  {
    num: '02',
    title: 'Prioritize by Spend Impact',
    text: 'Filter customers at high defection probability who contribute the largest revenue share.',
  },
  {
    num: '03',
    title: 'Deploy Timely Interventions',
    text: 'Take immediate action with targeted messaging before the relationship is permanently broken.',
  },
]

export default function RetentionHighlight() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#291C2E] via-[#373152] to-[#291C2E] border border-[#EBC69F]/40 p-8 text-[#FFF3E4] shadow-2xl sm:p-12">
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#EBC69F]/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F]/40 bg-[#291C2E]/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#EBC69F] mb-3">
          <DoodleSparkle size={14} className="text-[#E6B95F]" />
          <span>Practical Customer Retention</span>
        </div>
        <h2 className="font-editorial text-3xl font-bold tracking-tight text-[#FFF3E4] sm:text-4xl">
          Less guessing. Meaningful, timely customer follow-up.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#F4D3B5]/85 sm:text-base">
          Rather than blasting generic discounts to every shopper, ChurnGuard pinpoints exactly who is slipping away so every interaction feels personal and thoughtful.
        </p>
      </div>

      <div className="relative z-10 mt-10 grid gap-6 md:grid-cols-3">
        {actions.map((act) => (
          <article
            key={act.num}
            className="rounded-2xl border border-[#EBC69F]/30 bg-[#291C2E]/75 p-6 backdrop-blur-xs transition hover:border-[#E6B95F]/80"
          >
            <span className="font-editorial text-3xl font-bold text-[#E6B95F] block mb-2">
              {act.num}
            </span>
            <h3 className="font-editorial text-lg font-bold text-[#FFF3E4]">
              {act.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#F4D3B5]/75">
              {act.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
