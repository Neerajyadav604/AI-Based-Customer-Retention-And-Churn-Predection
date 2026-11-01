import { useEffect, useState } from 'react'

const WORDS = ['Launching Workspace', 'Fetching Data', 'Building Dashboard', 'Almost Ready']
const STEP = 1800

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white" role="status" aria-live="polite">
      <style>{`
        @keyframes launch-loader-roll {
          0% { transform: translateY(110%); }
          20% { transform: translateY(0); }
          80% { transform: translateY(0); }
          100% { transform: translateY(-110%); }
        }
      `}</style>
      <h1 key={idx} className="whitespace-nowrap text-center text-[8vw] font-bold uppercase leading-none tracking-[0.06em] text-blue-600">
        {WORDS[idx].split('').map((character, index) => (
          <span key={`${idx}-${index}`} className="inline-block overflow-hidden py-[0.08em] align-top">
            <span
              className="inline-block"
              style={{ animation: `launch-loader-roll ${STEP}ms ease-in-out ${index * 40}ms both` }}
            >
              {character === ' ' ? '\u00a0' : character}
            </span>
          </span>
        ))}
      </h1>
    </div>
  )
}
