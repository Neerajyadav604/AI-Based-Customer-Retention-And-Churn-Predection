import { DoodleSparkle } from '../components/Doodles'

export default function Contact() {
  return (
    <div className="mx-auto max-w-2xl py-12 text-[#291C2E]">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#494269] mb-4">
        <DoodleSparkle size={14} className="text-[#E6B95F]" />
        <span>Get in Touch</span>
      </div>
      <h1 className="font-editorial text-4xl font-bold tracking-tight text-[#291C2E] sm:text-5xl">
        Contact Project Team
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[#392D35]">
        Have questions regarding the predictive algorithms, integration pipelines, or dataset methodology?
      </p>

      <div className="mt-8 rounded-3xl border border-[#EBC69F] bg-white p-8 shadow-sm space-y-4 text-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#494269]">Direct Inquiries</p>
          <p className="mt-1 font-mono font-medium text-[#291C2E]">
            <a href="mailto:support@churnguard.app" className="text-[#494269] underline hover:text-[#291C2E]">
              support@churnguard.app
            </a>
          </p>
        </div>
        <div className="border-t border-[#EBC69F]/40 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#494269]">Project Affiliation</p>
          <p className="mt-1 text-xs text-[#392D35]">
            Final-Year B.Tech Computer Engineering & Machine Learning Project.
          </p>
        </div>
      </div>
    </div>
  )
}
