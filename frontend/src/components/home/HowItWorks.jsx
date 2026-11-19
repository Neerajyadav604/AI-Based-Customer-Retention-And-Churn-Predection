import { DoodleSparkle } from '../Doodles'

const steps = [
  {
    step: '01',
    title: 'Upload Order Records',
    desc: 'Export order data from Shopify, WooCommerce, Excel, or POS systems with basic customer dates and quantities.',
  },
  {
    step: '02',
    title: 'Real-Time ML Scoring',
    desc: 'The trained model builds behavioral features and scores churn probability for every account with clear risk tiers.',
  },
  {
    step: '03',
    title: 'Deploy Retention Playbooks',
    desc: 'Follow prioritized next-step actions to recover at-risk customers, protect cash flow, and measure re-engagement.',
  },
]

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="scroll-mt-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#291C2E] mb-3">
        <DoodleSparkle size={14} className="text-[#E6B95F]" />
        <span>Simple 3-Step Process</span>
      </div>
      <h2 className="mx-auto max-w-xl font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
        From raw transaction logs to preserved revenue
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-[#392D35]">
        No complicated data engineering required. Upload your spreadsheet and receive immediate retention intelligence.
      </p>

      <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
        {steps.map((item) => (
          <article
            key={item.step}
            className="relative rounded-3xl border border-[#EBC69F]/80 bg-white p-8 shadow-[0_4px_24px_rgba(41,38,56,0.04)] card-hover-lift"
          >
            <span className="font-editorial text-4xl font-bold text-[#E6B95F] block mb-4">
              {item.step}
            </span>
            <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#392D35]">
              {item.desc}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
