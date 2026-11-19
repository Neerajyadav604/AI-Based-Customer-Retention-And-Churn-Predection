import { DoodleSparkle } from '../Doodles'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    title: 'Behavioral Cohort Scoring',
    text: "Automated RFM analysis classifying each account into High, Medium, or Low churn probability cohorts.",
    tag: 'RFM Analytics',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Model Explainability & Drivers',
    text: 'Inspect feature importance rankings and confusion matrix diagnostics to understand what really drives churn.',
    tag: 'ML Telemetry',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="size-6 stroke-current stroke-2">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Prescriptive Retention Playbooks',
    text: 'Custom retention action plans tailored specifically to each customer risk profile to safeguard recurring revenue.',
    tag: 'Actionable Playbooks',
  },
]

export default function FeatureCards() {
  return (
    <div id="features" className="scroll-mt-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#291C2E] mb-3">
        <DoodleSparkle size={14} className="text-[#E6B95F]" />
        <span>Built for Practical Retention</span>
      </div>
      <h2 className="mx-auto max-w-xl font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
        Understand risk. Take the right retention action.
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-[#392D35]">
        Stop losing customers quietly. Spot changes in ordering velocity before accounts go dormant.
      </p>

      <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
        {features.map((item) => (
          <article
            key={item.title}
            className="group relative rounded-3xl border border-[#EBC69F]/80 bg-white p-7 shadow-[0_4px_24px_rgba(41,38,56,0.04)] card-hover-lift"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#291C2E] text-[#E6B95F] shadow-sm transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="rounded-full bg-[#FFF8ED] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#291C2E] border border-[#EBC69F]/60">
                {item.tag}
              </span>
            </div>
            <h3 className="mt-6 font-editorial text-xl font-bold text-[#291C2E]">
              {item.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#392D35]">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
