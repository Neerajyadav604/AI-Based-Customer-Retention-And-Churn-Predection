import { useEffect, useState } from 'react'
import { DoodleSparkle } from './Doodles'

const WORDS = [
  'Launching Workspace',
  'Fetching Retention Data',
  'Evaluating Cohorts',
  'Ready to Retain',
]
const STEP = 1400

export default function LaunchLoader({ onDone }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (idx === WORDS.length - 1) {
        onDone?.()
      } else {
        setIdx(idx + 1)
      }
    }, STEP)
    return () => window.clearTimeout(timer)
  }, [idx, onDone])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFF8ED]/95 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes launch-loader-roll {
          0% { transform: translateY(115%); opacity: 0; filter: blur(3px); }
          22% { transform: translateY(0); opacity: 1; filter: blur(0px); }
          78% { transform: translateY(0); opacity: 1; filter: blur(0px); }
          100% { transform: translateY(-115%); opacity: 0; filter: blur(3px); }
        }
      `}</style>

      {/* Decorative Aura */}
      <div className="pointer-events-none absolute size-96 rounded-full bg-[#EBC69F]/40 blur-3xl" />

      {/* Animated Brand Crest */}
      <div className="relative z-10 mb-6 flex size-20 items-center justify-center rounded-3xl bg-[#494269] text-[#E6B95F] shadow-[0_16px_36px_rgba(73,66,105,0.35)] ring-4 ring-[#E6B95F]/30 animate-pulse">
        <svg viewBox="0 0 24 24" fill="none" className="size-10 stroke-current stroke-2">
          <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <DoodleSparkle size={20} className="absolute -top-2 -right-2 text-[#E6B95F]" />
      </div>

      {/* Rolling Text: Styled in our Deep Muted Purple #494269 with Editorial Serif Font */}
      <div className="relative z-10 max-w-xl px-6 text-center">
        <h1
          key={idx}
          className="font-editorial text-3xl font-bold tracking-tight text-[#494269] drop-shadow-sm sm:text-4xl md:text-5xl"
        >
          {WORDS[idx].split('').map((char, i) => (
            <span
              key={`${idx}-${i}`}
              className="inline-block overflow-hidden py-[0.1em] align-top"
            >
              <span
                className="inline-block"
                style={{
                  animation: `launch-loader-roll ${STEP}ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 35}ms both`,
                }}
              >
                {char === ' ' ? '\u00a0' : char}
              </span>
            </span>
          ))}
        </h1>

        <p className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-[#A99BB9]">
          ChurnGuard Intelligence Engine
        </p>

        {/* Glossy Progress Pill */}
        <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full border border-[#EBC69F]/80 bg-[#FFF8ED] p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#494269] via-[#A99BB9] to-[#E6B95F] transition-all duration-700 ease-out"
            style={{ width: `${((idx + 1) / WORDS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
