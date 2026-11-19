import LaunchWorkspaceButton from '../LaunchWorkspaceButton'
import { DoodleSparkle } from '../Doodles'

export default function HomeCta() {
  return (
    <div
      id="for-shops"
      className="relative overflow-hidden rounded-3xl border-2 border-[#EBC69F] bg-gradient-to-br from-[#FFF8ED] via-[#FFF3E4] to-[#F4D3B5]/30 px-6 py-14 text-center shadow-[0_16px_40px_rgba(41,28,46,0.08)] sm:px-12"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-[#EBC69F] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#291C2E] mb-4">
        <DoodleSparkle size={14} className="text-[#E6B95F]" />
        <span>For Small Retailers & Modern Online Sellers</span>
      </div>
      <h2 className="mx-auto max-w-2xl font-editorial text-3xl font-bold tracking-tight text-[#291C2E] sm:text-4xl">
        Start protecting your customer relationships today.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#392D35]">
        Engineered for independent brands, Shopify stores, and local vendors as an applied B.Tech machine learning project. Simple setup, zero complex data plumbing.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <LaunchWorkspaceButton className="rounded-2xl bg-gradient-to-r from-[#F3C66F] via-[#E6B95F] to-[#D6A34E] text-[#291C2E] font-bold px-7 py-3.5 text-base shadow-md hover:shadow-xl hover:-translate-y-0.5 transition btn-interactive">
          Launch Workspace Free
        </LaunchWorkspaceButton>
      </div>
    </div>
  )
}
