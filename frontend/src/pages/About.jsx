import { DoodleSparkle } from '../components/Doodles'

export default function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-10 text-[#291C2E]">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#494269] mb-4">
          <DoodleSparkle size={14} className="text-[#E6B95F]" />
          <span>Academic & Industry Research</span>
        </div>
        <h1 className="font-editorial text-4xl font-bold tracking-tight text-[#291C2E] sm:text-5xl">
          About the ChurnGuard Project
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#392D35] sm:text-lg">
          An applied B.Tech final-year research initiative engineered to bridge enterprise predictive intelligence with accessible, actionable tools for local online vendors, retail shops, and small enterprises.
        </p>
      </div>

      {/* Core Methodology RFM */}
      <div className="rounded-3xl border border-[#EBC69F] bg-white p-8 sm:p-10 shadow-sm">
        <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">
          Mathematical Foundation: RFM Analytics
        </h2>
        <p className="mt-2 text-sm text-[#392D35]">
          Rather than relying on vague sentiment, ChurnGuard computes empirical behavioral features from raw transactional orders:
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EBC69F]/80 bg-[#FFF8ED]/50 p-6">
            <span className="font-editorial text-2xl font-bold text-[#494269]">Recency</span>
            <p className="mt-2 text-xs leading-relaxed text-[#392D35]">
              Days elapsed since the customer last transacted. Strongest predictive indicator of defection risk.
            </p>
          </div>
          <div className="rounded-2xl border border-[#EBC69F]/80 bg-[#FFF8ED]/50 p-6">
            <span className="font-editorial text-2xl font-bold text-[#494269]">Frequency</span>
            <p className="mt-2 text-xs leading-relaxed text-[#392D35]">
              Total count of historic orders. Measures engagement consistency and ongoing relationship strength.
            </p>
          </div>
          <div className="rounded-2xl border border-[#EBC69F]/80 bg-[#FFF8ED]/50 p-6">
            <span className="font-editorial text-2xl font-bold text-[#494269]">Monetary</span>
            <p className="mt-2 text-xs leading-relaxed text-[#392D35]">
              Lifetime gross revenue generated. Helps prioritize retention marketing on accounts with highest lifetime value.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-3xl border border-[#EBC69F] bg-[#494269] p-8 text-[#FFF3E4]">
        <h2 className="font-editorial text-2xl font-bold text-[#F4D3B5]">
          Technical Architecture & Stack
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs text-[#F4D3B5]/90">
          <div className="rounded-xl bg-[#373152] p-4 border border-[#A99BB9]/30">
            <strong className="text-[#E6B95F] block text-sm mb-1">Inference Engine</strong>
            FastAPI, Scikit-Learn Logistic Regression Pipeline, Joblib, Pandas feature transformers.
          </div>
          <div className="rounded-xl bg-[#373152] p-4 border border-[#A99BB9]/30">
            <strong className="text-[#E6B95F] block text-sm mb-1">Frontend Client</strong>
            React 19, Vite 8, Tailwind CSS v4, Recharts, Editorial Fraunces & Plus Jakarta Sans typography.
          </div>
          <div className="rounded-xl bg-[#373152] p-4 border border-[#A99BB9]/30">
            <strong className="text-[#E6B95F] block text-sm mb-1">Data Storage</strong>
            MongoDB Atlas for user management and auth; MySQL/TiDB for transactional order logs and run histories.
          </div>
          <div className="rounded-xl bg-[#373152] p-4 border border-[#A99BB9]/30">
            <strong className="text-[#E6B95F] block text-sm mb-1">Security & Billing</strong>
            JWT token session management, bcrypt salt hashing, and Razorpay payment checkout integration.
          </div>
        </div>
      </div>

      {/* Disclaimer / Limitations */}
      <div className="rounded-3xl border-2 border-[#EBC69F] bg-[#FAF2DF] p-6 text-xs text-[#8C6819]">
        <h3 className="font-editorial text-lg font-bold text-[#8C6819] mb-1">Academic Project Scope & Dataset Notes</h3>
        <p className="leading-relaxed">
          The baseline ML model is trained and benchmarked on public e-commerce transaction records. Predictions provide probabilistic risk guidance and are intended to assist business owners in prioritizing customer follow-up actions.
        </p>
      </div>
    </div>
  )
}
