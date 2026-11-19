import { useEffect, useState, useRef } from 'react'

export default function AnimatedRiskOrb({ targetProbability, riskLevel, likelyToChurn }) {
  // Target percentage from 0 to 100
  const numericTarget = typeof targetProbability === 'number' 
    ? targetProbability 
    : parseFloat(targetProbability || 0)
  const finalVal = Math.max(0, Math.min(100, (numericTarget > 1 ? numericTarget : numericTarget * 100)))
  
  const [displayVal, setDisplayVal] = useState(0)
  const [progressAngle, setProgressAngle] = useState(0)
  const animFrameRef = useRef(null)

  // Colors & theme based on risk tier
  const themes = {
    High: {
      gradient: 'radial-gradient(circle at 35% 30%, #F87171 0%, #B83838 55%, #7F1D1D 100%)',
      glow: 'rgba(184, 56, 56, 0.55)',
      trackStroke: '#B83838',
      accentColor: '#EF4444',
      textShadow: '0 0 12px rgba(184, 56, 56, 0.6)',
      pillBg: 'bg-[#FAECEC]',
    },
    Medium: {
      gradient: 'radial-gradient(circle at 35% 30%, #FDE047 0%, #E6B95F 55%, #B45309 100%)',
      glow: 'rgba(230, 185, 95, 0.65)',
      trackStroke: '#E6B95F',
      accentColor: '#F59E0B',
      textShadow: '0 0 12px rgba(230, 185, 95, 0.6)',
      pillBg: 'bg-[#FAF2DF]',
    },
    Low: {
      gradient: 'radial-gradient(circle at 35% 30%, #86EFAC 0%, #43823C 55%, #14532D 100%)',
      glow: 'rgba(67, 130, 60, 0.55)',
      trackStroke: '#43823C',
      accentColor: '#22C55E',
      textShadow: '0 0 12px rgba(67, 130, 60, 0.6)',
      pillBg: 'bg-[#EAF5E9]',
    },
  }

  const theme = themes[riskLevel] || themes.Low

  useEffect(() => {
    // Start count-up animation from 0 to finalVal
    let startTimestamp = null
    const duration = 1400 // 1.4s smooth easing

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3)
      const currentNumber = ease * finalVal
      setDisplayVal(Number(currentNumber.toFixed(1)))
      setProgressAngle(ease * (finalVal / 100) * 360)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        setDisplayVal(Number(finalVal.toFixed(1)))
      }
    }

    // Reset to 0 and trigger frame
    setDisplayVal(0)
    animFrameRef.current = requestAnimationFrame(step)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [finalVal])

  // SVG circular arc circumference
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayVal / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center my-4">
      <style>{`
        @keyframes orb-gloss-pulse {
          0%, 100% {
            box-shadow: 0 12px 30px -4px ${theme.glow}, 0 0 18px 2px ${theme.glow}, inset 0 2px 4px rgba(255, 255, 255, 0.6);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 16px 40px -2px ${theme.glow}, 0 0 30px 6px ${theme.glow}, inset 0 4px 8px rgba(255, 255, 255, 0.8);
            transform: scale(1.035);
          }
        }

        @keyframes wheel-kinetic-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes particle-bubble {
          0% { transform: translateY(18px) scale(0.5); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translateY(-26px) scale(1.1); opacity: 0; }
        }
      `}</style>

      {/* Circular Gauge Frame */}
      <div className="relative size-36 sm:size-40 flex items-center justify-center select-none">
        
        {/* Subtle rotating kinetic dashed wheel ring */}
        <div 
          className="absolute inset-0 size-full rounded-full border border-dashed border-[#EBC69F]/40 pointer-events-none"
          style={{ animation: 'wheel-kinetic-spin 24s linear infinite' }}
        />

        {/* SVG Circular Progress Track that fills from 0 to target */}
        <svg
          className="absolute inset-0 size-full -rotate-90 pointer-events-none"
          viewBox="0 0 128 128"
        >
          {/* Background track circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#FFF8ED"
            strokeWidth="7"
          />
          {/* Animated active filling stroke with gradient & glow */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={theme.trackStroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.05s linear',
              filter: `drop-shadow(0 0 6px ${theme.glow})`,
            }}
          />
        </svg>

        {/* Ambient Gloss Outer Halo */}
        <div
          className="absolute inset-4 rounded-full pointer-events-none"
          style={{
            animation: 'orb-gloss-pulse 3.2s ease-in-out infinite',
            borderRadius: '9999px',
          }}
        />

        {/* Central 3D Fluid Glossy Sphere */}
        <div
          className="relative size-24 sm:size-26 rounded-full flex flex-col items-center justify-center font-mono text-white shadow-xl overflow-hidden cursor-pointer group"
          style={{
            background: theme.gradient,
            border: '2px solid rgba(255, 255, 255, 0.65)',
          }}
        >
          {/* Glossy Curved Glass Bevel Highlight */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4/5 h-1/2 rounded-full bg-gradient-to-b from-white/45 via-white/15 to-transparent pointer-events-none" />

          {/* Floating Ascending Micro Bubbles */}
          <span
            className="absolute size-1.5 rounded-full bg-white/70"
            style={{ left: '25%', animation: 'particle-bubble 2.2s ease-in infinite 0.2s' }}
          />
          <span
            className="absolute size-1 rounded-full bg-white/60"
            style={{ left: '65%', animation: 'particle-bubble 2.6s ease-in infinite 0.8s' }}
          />

          {/* Live Count-Up Text (Moves from 0.0% to where it should) */}
          <span
            className="relative z-10 text-xl sm:text-2xl font-extrabold tracking-tight"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {displayVal.toFixed(1)}%
          </span>
          <span className="relative z-10 text-[9px] uppercase font-sans font-bold tracking-wider text-white/90">
            Defection Risk
          </span>
        </div>
      </div>

      {/* Glossy Progress Bar below circle */}
      <div className="w-56 mt-3 space-y-1">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-[#494269]">Live Risk Calibration</span>
          <span className="font-mono text-[#291C2E]">{displayVal.toFixed(1)}%</span>
        </div>
        <div className="relative h-2.5 w-full rounded-full bg-[#FFF8ED] overflow-hidden p-0.5 border border-[#EBC69F]/60 shadow-inner">
          <div
            className="relative h-full rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${displayVal}%`,
              backgroundColor: theme.trackStroke,
              boxShadow: `0 0 12px ${theme.glow}`,
            }}
          >
            {/* Glossy Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
