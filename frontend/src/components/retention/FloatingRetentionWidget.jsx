import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FloatingRetentionWidget({ dataset, onClose }) {
  const navigate = useNavigate()
  const [isMinimized, setIsMinimized] = useState(false)

  if (!dataset) return null

  const { uploadId, filename, summary } = dataset
  const highRisk = summary?.high || 0
  const total = summary?.total || 0

  function handleExplore() {
    const targetUrl = uploadId
      ? `/retention-intelligence?upload_id=${uploadId}`
      : `/retention-intelligence`
    navigate(targetUrl)
  }

  // If minimized into a compact floating pill
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2.5 rounded-full border-1.5 border-[#EBC69F] bg-gradient-to-r from-[#291C2E] to-[#373152] px-4 py-2.5 text-[#FFF3E4] shadow-[0_12px_32px_rgba(41,28,46,0.28)] backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer animate-in fade-in slide-in-from-bottom-3"
        onClick={() => setIsMinimized(false)}
        role="button"
        title="Open Retention Intelligence Insights"
      >
        <span className="flex size-2 rounded-full bg-[#E6B95F] animate-pulse" />
        <span className="text-xs font-bold text-[#FFF3E4]">Retention Intelligence</span>
        {highRisk > 0 && (
          <span className="rounded-full bg-[#B83838] px-2 py-0.5 text-[10px] font-bold text-white">
            {highRisk} At Risk
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="ml-1 text-[#F4D3B5]/60 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <aside
      aria-label="Retention Intelligence Alert"
      className="fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] sm:w-[380px] max-w-sm rounded-3xl border-2 border-[#EBC69F] bg-[#FFF8ED] p-5 shadow-[0_20px_50px_-10px_rgba(41,28,46,0.32)] backdrop-blur-xl transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6"
    >
      {/* Top Bar with Accent Pill & Dismiss Buttons */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBC69F]/60">
        <div className="flex items-center gap-2">
          <span className="flex size-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E6B95F] opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-[#E6B95F]" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#494269]/90">
            Batch Inference Complete
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#494269]">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
            className="flex size-6 items-center justify-center rounded-lg hover:bg-[#EBC69F]/40 transition text-xs font-bold text-[#494269]"
          >
            —
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Dismiss"
            className="flex size-6 items-center justify-center rounded-lg hover:bg-[#EBC69F]/40 transition text-sm text-[#494269]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-3.5 space-y-2.5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#291C2E] to-[#373152] text-[#E6B95F] shadow-sm">
            <span className="text-lg">🎯</span>
          </div>

          <div>
            <h3 className="font-editorial text-lg font-bold text-[#291C2E] leading-snug">
              Retention Intelligence
            </h3>
            <p className="text-xs text-[#392D35] leading-relaxed mt-0.5">
              Understand why customers may churn and discover how to retain them.
            </p>
          </div>
        </div>

        {/* Dataset Quick Metrics Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
          <span className="rounded-lg bg-[#FAF2DF] border border-[#EBC69F]/70 px-2.5 py-1 font-semibold text-[#8C6819]">
            {filename ? filename : `Dataset #${uploadId || 'Active'}`}
          </span>
          <span className="rounded-lg bg-white border border-[#EBC69F]/50 px-2.5 py-1 text-[#291C2E]">
            {total} accounts
          </span>
          {highRisk > 0 && (
            <span className="rounded-lg bg-[#FAECEC] border border-[#C87979]/60 px-2.5 py-1 font-bold text-[#B83838]">
              {highRisk} high risk
            </span>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleExplore}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#291C2E] via-[#373152] to-[#291C2E] px-4 py-2.5 text-xs font-bold text-[#FFF3E4] shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <span>Explore Retention Insights</span>
            <span className="text-sm font-normal text-[#E6B95F]">→</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
