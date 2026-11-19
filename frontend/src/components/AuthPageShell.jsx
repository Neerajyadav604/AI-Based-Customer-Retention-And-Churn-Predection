import { Link } from 'react-router-dom'
import { DoodleSparkle } from './Doodles'

export default function AuthPageShell({
  children,
  title,
  subtitle,
  switchText,
  switchLabel,
  switchTo,
  illustration,
}) {
  return (
    <div className="relative min-h-screen bg-[#291C2E] text-[#FFF3E4] overflow-hidden flex items-center justify-center py-16 px-4 sm:px-6">
      {/* Decorative Warm Auras matching palette */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-[#494269]/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-[#EBC69F]/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* Form container */}
        <div className="mx-auto w-full max-w-md rounded-3xl border border-[#A99BB9]/30 bg-[#373152]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#E6B95F] text-[#291C2E] text-xs font-bold">
                ✓
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#EBC69F]">
                ChurnGuard Security
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#FFF3E4] sm:text-4xl">
                {title}
              </h1>
              <DoodleSparkle size={20} className="text-[#E6B95F]" />
            </div>
            {subtitle && (
              <p className="mt-2 text-xs text-[#F4D3B5]/80 leading-relaxed">
                {subtitle}
              </p>
            )}
            <p className="mt-2 text-xs text-[#F4D3B5]/75">
              {switchText}{' '}
              <Link
                to={switchTo}
                className="font-semibold text-[#E6B95F] hover:text-[#FFF3E4] underline decoration-[#E6B95F]/50 underline-offset-4"
              >
                {switchLabel}
              </Link>
            </p>
          </div>

          {children}
        </div>

        {/* Right illustrative panel: Featuring the interactive Lottie animation */}
        <div className="hidden lg:flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-lg rounded-3xl border border-[#A99BB9]/25 bg-[#494269]/35 p-6 shadow-2xl backdrop-blur-xs">
            <div className="flex justify-center">{illustration}</div>
            <h2 className="mt-4 font-editorial text-2xl font-bold text-[#F4D3B5]">
              Intelligent Customer Retention
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#A99BB9] max-w-sm mx-auto">
              Spot behavioral churn risks and deploy targeted re-engagement playbooks before revenue is lost.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 text-xs text-[#EBC69F]/80 border-t border-[#A99BB9]/20 pt-4">
              <span>✦ 94% retention insights</span>
              <span>•</span>
              <span>Instant batch scoring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
