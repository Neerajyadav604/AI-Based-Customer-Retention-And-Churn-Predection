import { DoodleSparkle } from '../components/Doodles'
import { Link } from 'react-router-dom'

export default function Docs() {
  return (
    <div className="mx-auto max-w-4xl py-12 text-[#291C2E] space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#494269] mb-4">
          <DoodleSparkle size={14} className="text-[#E6B95F]" />
          <span>Documentation & Guide</span>
        </div>
        <h1 className="font-editorial text-4xl font-bold tracking-tight text-[#291C2E] sm:text-5xl">
          ChurnGuard Developer & User Docs
        </h1>
        <p className="mt-4 text-base text-[#392D35]">
          Comprehensive guide to CSV formats, scoring pipelines, and API schemas.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-[#EBC69F] bg-white p-8 shadow-sm">
          <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">1. CSV Upload Schema</h2>
          <p className="mt-2 text-xs text-[#392D35]">Batch uploads require the following column names in your CSV header:</p>
          <div className="mt-4 rounded-xl bg-[#FFF8ED] p-4 font-mono text-xs text-[#494269] border border-[#EBC69F]/60">
            customer_id, order_id, order_date, quantity, unit_price
          </div>
          <ul className="mt-4 space-y-2 text-xs text-[#392D35]">
            <li>• <code>customer_id</code>: Unique identifier for each account.</li>
            <li>• <code>order_id</code>: Unique purchase invoice number.</li>
            <li>• <code>order_date</code>: ISO or standard format date (e.g. <code>2026-10-01</code>).</li>
            <li>• <code>quantity</code> & <code>unit_price</code>: Numeric items count and price per unit.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-[#EBC69F] bg-white p-8 shadow-sm">
          <h2 className="font-editorial text-2xl font-bold text-[#291C2E]">2. Sensitivity Thresholds</h2>
          <p className="mt-2 text-xs text-[#392D35]">
            The Logistic Regression classifier utilizes an optimized decision threshold of <code>0.45</code>:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-xl bg-[#FAECEC] p-4 text-[#8C2A2A] border border-[#C87979]">
              <strong>High Risk (≥ 60%)</strong>
              <p className="mt-1 text-[11px]">Immediate outreach or win-back incentive required.</p>
            </div>
            <div className="rounded-xl bg-[#FAF2DF] p-4 text-[#8C6819] border border-[#E6B95F]">
              <strong>Medium Risk (40% - 59%)</strong>
              <p className="mt-1 text-[11px]">Check-in message or gentle product recommendation.</p>
            </div>
            <div className="rounded-xl bg-[#EAF5E9] p-4 text-[#2D5A27] border border-[#7EAA79]">
              <strong>Low Risk (&lt; 40%)</strong>
              <p className="mt-1 text-[11px]">Healthy engagement, recurring customer care.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#EBC69F] bg-[#494269] p-8 text-[#FFF3E4]">
          <h2 className="font-editorial text-2xl font-bold text-[#F4D3B5]">3. REST API Endpoints</h2>
          <p className="mt-2 text-xs text-[#A99BB9]">
            FastAPI OpenAPI interactive Swagger documentation is available locally:
          </p>
          <div className="mt-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E6B95F] px-4 py-2 text-xs font-bold text-[#291C2E] shadow-sm hover:bg-[#D6A34E] transition"
            >
              Open Swagger API Explorer (/docs) →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
