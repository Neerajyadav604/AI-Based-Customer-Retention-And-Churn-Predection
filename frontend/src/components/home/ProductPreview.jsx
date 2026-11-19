import { useState, useEffect } from 'react'
import RiskBadge from '../RiskBadge'
import { DoodleAvatar, DoodleSparkle } from '../Doodles'

export default function ProductPreview() {
  // Live kinetic fluctuation for the 3D circular orb (drifts between 89% and 94%)
  const [orbPct, setOrbPct] = useState(91)
  const [hoveredOrb, setHoveredOrb] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(false)

  // Fluid live wave fluctuation for behavioral risk progress bars
  const [barOffsets, setBarOffsets] = useState([85, 68, 42, 55])

  useEffect(() => {
    // Dynamic percentage drift interval
    const orbTimer = setInterval(() => {
      setOrbPct((prev) => {
        const delta = (Math.random() - 0.5) * 2.2
        const next = Math.min(94, Math.max(88.5, prev + delta))
        return Number(next.toFixed(1))
      })
    }, 1800)

    // Dynamic bar fluctuation
    const barTimer = setInterval(() => {
      setBarOffsets([
        Number((85 + Math.sin(Date.now() / 900) * 4.5).toFixed(1)),
        Number((68 + Math.cos(Date.now() / 1100) * 5.0).toFixed(1)),
        Number((42 + Math.sin(Date.now() / 800) * 3.5).toFixed(1)),
        Number((55 + Math.cos(Date.now() / 1000) * 4.0).toFixed(1)),
      ])
    }, 400)

    return () => {
      clearInterval(orbTimer)
      clearInterval(barTimer)
    }
  }, [])

  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border-2 border-[#EBC69F] bg-[#FFF8ED]/30 shadow-[0_24px_60px_-15px_rgba(73,66,105,0.22)] backdrop-blur-md">
      {/* Dynamic Keyframe Animations for Fluid Orb, Streaming Dots & Sparkles */}
      <style>{`
        @keyframes orb-breathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px 4px rgba(184, 56, 56, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4);
          }
          50% {
            transform: scale(1.045);
            box-shadow: 0 0 32px 8px rgba(184, 56, 56, 0.65), 0 0 12px 2px rgba(230, 185, 95, 0.5), inset 0 3px 6px rgba(255, 255, 255, 0.6);
          }
        }

        @keyframes wheel-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes wheel-rotate-rev {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes bubble-rise {
          0% { transform: translateY(16px) scale(0.6); opacity: 0; }
          40% { opacity: 0.85; }
          100% { transform: translateY(-24px) scale(1.1); opacity: 0; }
        }

        @keyframes antigravity-flow {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        @keyframes tip-spark-drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate(14px, -14px) scale(0); opacity: 0; }
        }

        @keyframes star-twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 4px #E6B95F); }
          50% { transform: scale(1.3) rotate(20deg); filter: drop-shadow(0 0 12px #E6B95F); }
        }

        @keyframes button-hover-float {
          0%, 100% { transform: translateY(0px); box-shadow: 0 10px 24px -4px rgba(230, 185, 95, 0.6); }
          50% { transform: translateY(-3.5px); box-shadow: 0 16px 30px -4px rgba(230, 185, 95, 0.85), 0 0 20px 4px rgba(230, 185, 95, 0.4); }
        }

        .orb-active-breathing {
          animation: orb-breathe 3.6s ease-in-out infinite;
        }

        .antigravity-bar {
          background-size: 200% 100%;
          animation: antigravity-flow 2.4s linear infinite;
        }

        .golden-button-float {
          animation: button-hover-float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Browser Chrome Header (exact original dark purple #494269 with gold URL pill) */}
      <div className="flex items-center justify-between border-b border-[#EBC69F]/70 bg-[#494269] px-5 py-3 text-xs text-[#FFF3E4]">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#EBC69F] shadow-xs" />
          <span className="size-3 rounded-full bg-[#E6B95F] shadow-xs" />
          <span className="size-3 rounded-full bg-[#A99BB9] shadow-xs" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-2 rounded-xl bg-[#373152] px-6 py-1.5 font-mono text-[11px] text-[#F4D3B5] border border-[#A99BB9]/30 shadow-inner">
          <span className="text-[#E6B95F]">churnguard.app</span>
          <span className="text-[#A99BB9]">/</span>
          <span>workspace</span>
          <span className="text-[#A99BB9]">/</span>
          <span className="text-[#EBC69F]">customer-cohorts</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-[10px] text-[#EBC69F]">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="font-medium tracking-wide">Real-time ML Model</span>
        </div>
      </div>

      {/* Main Dashboard Canvas (exact original warm cream background #FFF3E4) */}
      <div className="bg-[#FFF3E4] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[1.1fr_1.45fr_1fr] items-stretch">
          
          {/* =========================================================================
              CARD 1 (LEFT): 3D GLOWING RISK ORB & PROFILE
             ========================================================================= */}
          <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm card-hover-lift flex flex-col justify-between relative overflow-hidden">
            {/* Top Row: Risk Badge & Account ID */}
            <div>
              <div className="flex items-start justify-between">
                <RiskBadge riskLevel="High" size="sm" />
                <span className="font-mono text-xs font-bold text-[#494269]">#C-1042</span>
              </div>

              {/* Avatar & Customer Name */}
              <div className="mt-4 flex items-center gap-3">
                <DoodleAvatar id={3} size={44} className="ring-2 ring-[#EBC69F]" />
                <div>
                  <p className="text-base font-editorial font-bold text-[#291C2E]">Aria Vance</p>
                  <p className="text-xs text-[#392D35]">Retail Enterprise</p>
                </div>
              </div>

              {/* Critical Retention Risk Card with 3D Rotating Glowing Orb */}
              <div
                onMouseEnter={() => setHoveredOrb(true)}
                onMouseLeave={() => setHoveredOrb(false)}
                className="mt-6 rounded-2xl bg-gradient-to-br from-[#FAECEC] via-[#FAECEC]/90 to-[#FAF2DF]/40 p-4 border border-[#C87979]/50 shadow-inner relative overflow-hidden transition-all duration-300"
              >
                <div className="flex items-center gap-4 relative z-10">
                  {/* Interactive Kinetic 3D Glowing Orb Container */}
                  <div className="relative size-18 shrink-0 flex items-center justify-center">
                    {/* Outer Rotating Segmented Wheel (Moves like a dial/wheel) */}
                    <div
                      className="absolute inset-0 rounded-full border-2 border-dashed border-[#B83838]/40"
                      style={{ animation: 'wheel-rotate 14s linear infinite' }}
                    />
                    <div
                      className="absolute -inset-1 rounded-full border border-t-[#E6B95F] border-r-transparent border-b-[#B83838] border-l-transparent opacity-70"
                      style={{ animation: 'wheel-rotate-rev 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    />

                    {/* Central 3D Fluid Breathing Sphere Orb */}
                    <div
                      className={`relative size-14 rounded-full flex flex-col items-center justify-center font-mono text-white select-none cursor-pointer orb-active-breathing transition-all ${
                        hoveredOrb ? 'scale-110 shadow-[0_0_36px_10px_rgba(184,56,56,0.7)]' : ''
                      }`}
                      style={{
                        background:
                          'radial-gradient(circle at 35% 30%, #F57878 0%, #B83838 55%, #6B1717 100%)',
                      }}
                    >
                      {/* Internal Floating Ascending Particles / Bubbles */}
                      <span
                        className="absolute size-1.5 rounded-full bg-white/75"
                        style={{ left: '30%', animation: 'bubble-rise 2.2s ease-in infinite 0.2s' }}
                      />
                      <span
                        className="absolute size-1 rounded-full bg-[#FFE6A5]/80"
                        style={{ left: '60%', animation: 'bubble-rise 2.8s ease-in infinite 0.7s' }}
                      />
                      <span
                        className="absolute size-1.5 rounded-full bg-white/60"
                        style={{ left: '45%', animation: 'bubble-rise 2.5s ease-in infinite 1.2s' }}
                      />

                      {/* Dynamic fluctuating live percentage */}
                      <span className="relative z-10 text-base font-extrabold tracking-tight drop-shadow-md">
                        {Math.round(orbPct)}%
                      </span>
                    </div>
                  </div>

                  {/* Text Details with Warm Ambient Glow */}
                  <div className="text-xs">
                    <p
                      className="font-bold text-[#8C2A2A] tracking-tight"
                      style={{
                        textShadow: '0 0 10px rgba(184, 56, 56, 0.35)',
                      }}
                    >
                      Critical Retention Risk
                    </p>
                    <p className="text-[11px] text-[#8C2A2A]/85 mt-1 leading-snug">
                      Order gap exceeded 45 days. High probability of defection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Last Order & LTV */}
            <div className="mt-6 flex justify-between border-t border-[#EBC69F]/50 pt-4 text-xs text-[#392D35]">
              <span>Last Order: <strong className="text-[#291C2E]">48d ago</strong></span>
              <span>LTV: <strong className="text-[#291C2E]">₹24,800</strong></span>
            </div>
          </div>


          {/* =========================================================================
              CARD 2 (CENTER): BEHAVIORAL RISK SIGNALS WITH ANTIGRAVITY FLOWING BARS
             ========================================================================= */}
          <div className="rounded-3xl border border-[#EBC69F] bg-white p-6 shadow-sm card-hover-lift flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#EBC69F]/50 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#494269]">
                  Behavioral Risk Signals
                </p>
                <span className="font-mono text-[11px] text-[#A99BB9]">RFM Decomposed</span>
              </div>

              <p className="mt-3 text-xs text-[#392D35]">
                Model weights pushing this customer into the high-risk cohort:
              </p>

              {/* Dynamic Antigravity Moving Signal Bars */}
              <div className="mt-5 space-y-4">
                {[
                  {
                    label: 'Recency Gap (48 days)',
                    impact: '+38% churn risk',
                    danger: true,
                    width: barOffsets[0],
                    gradient: 'from-[#B83838] via-[#E86060] to-[#B83838]',
                    tipColor: '#B83838',
                  },
                  {
                    label: 'Order Frequency Decline',
                    impact: '+24% churn risk',
                    danger: true,
                    width: barOffsets[1],
                    gradient: 'from-[#B83838] via-[#E6B95F] to-[#B83838]',
                    tipColor: '#B83838',
                  },
                  {
                    label: 'Average Basket Spend drop',
                    impact: '+12% churn risk',
                    danger: true,
                    width: barOffsets[2],
                    gradient: 'from-[#E6B95F] via-[#F3D9BE] to-[#E6B95F]',
                    tipColor: '#E6B95F',
                  },
                  {
                    label: 'Historical Multi-item buyer',
                    impact: '-18% retention shield',
                    danger: false,
                    width: barOffsets[3],
                    gradient: 'from-[#43823C] via-[#7EAA79] to-[#43823C]',
                    tipColor: '#43823C',
                  },
                ].map((item, idx) => (
                  <div key={item.label} className="group text-xs">
                    <div className="flex justify-between font-medium mb-1.5">
                      <span className="text-[#291C2E] font-semibold">{item.label}</span>
                      <span className={`font-mono text-[11px] ${item.danger ? 'text-[#8C2A2A]' : 'text-[#2D5A27]'}`}>
                        {item.impact}
                      </span>
                    </div>

                    {/* Progress Track with Elevated Floating Antigravity Bar */}
                    <div className="relative h-2.5 w-full rounded-full bg-[#FFF8ED] overflow-visible shadow-inner">
                      {/* Fluid Streaming Antigravity Bar */}
                      <div
                        className={`antigravity-bar relative h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-300 ease-out shadow-sm`}
                        style={{
                          width: `${item.width}%`,
                          boxShadow: `0 0 10px ${item.tipColor}55`,
                        }}
                      >
                        {/* Specular digital sheen overlay */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/35 to-transparent h-1/2 pointer-events-none" />

                        {/* Pulsing Tip with Floating Ascending Spark Dot */}
                        <span
                          className="absolute -right-1 -top-0.5 size-3.5 rounded-full border border-white shadow-md"
                          style={{
                            backgroundColor: item.tipColor,
                            boxShadow: `0 0 10px ${item.tipColor}`,
                          }}
                        >
                          {/* Spark drift particle */}
                          <span
                            className="absolute size-1.5 rounded-full bg-white"
                            style={{
                              animation: `tip-spark-drift 1.8s ease-out infinite ${idx * 0.3}s`,
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-[#A99BB9] italic border-t border-[#EBC69F]/40 pt-3">
              ✦ Live kinetic weights calibrate automatically with incoming transactional velocity.
            </p>
          </div>


          {/* =========================================================================
              CARD 3 (RIGHT): PLAYBOOK WITH 3D DEPTH & FLOATING GOLDEN BUTTON
             ========================================================================= */}
          <div className="rounded-3xl border border-[#EBC69F] bg-gradient-to-b from-[#494269] to-[#373152] p-6 text-[#FFF3E4] shadow-xl card-hover-lift flex flex-col justify-between relative overflow-hidden">
            {/* Subtle floating gold particle in background */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#E6B95F]/15 blur-2xl" />

            <div>
              {/* Header with Sparking Star */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-gradient-to-r from-[#F3C973] via-[#E6B95F] to-[#D6A34E] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#291C2E] shadow-sm">
                  Playbook
                </span>
                <span style={{ animation: 'star-twinkle 2.8s ease-in-out infinite' }}>
                  <DoodleSparkle size={18} className="text-[#E6B95F]" />
                </span>
              </div>

              {/* Title & Description */}
              <h4 className="mt-4 font-editorial text-2xl font-bold text-[#F4D3B5] tracking-tight">
                Recommended Action
              </h4>
              <p className="mt-2.5 text-xs leading-relaxed text-[#F4D3B5]/85">
                Send a personalized re-engagement campaign offering free priority shipping or an exclusive bundle credit.
              </p>

              {/* Channel & Success Metric Pill */}
              <div className="mt-5 rounded-2xl bg-[#291C2E]/80 p-4 text-xs border border-[#A99BB9]/30 backdrop-blur-xs shadow-inner space-y-2">
                <div className="flex items-center gap-1.5 text-[#EBC69F] font-semibold">
                  <span className="size-1.5 rounded-full bg-[#E6B95F]" />
                  <span>Suggested Channel: WhatsApp / Email</span>
                </div>
                <p className="text-[11px] text-[#F4D3B5]/80">
                  Estimated recovery success rate: <strong className="text-emerald-300">42%</strong>
                </p>
              </div>
            </div>

            {/* Elevated, Pulsing Floating Golden Button with Sparkle Glow */}
            <div className="pt-6">
              <button
                type="button"
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className={`golden-button-float w-full rounded-2xl py-3 text-xs font-bold text-[#291C2E] tracking-wide select-none cursor-pointer transition-all ${
                  hoveredButton ? 'brightness-110 scale-[1.02]' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #FAD68B 0%, #E6B95F 50%, #D6A34E 100%)',
                  boxShadow:
                    '0 12px 28px -4px rgba(230, 185, 95, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Apply Playbook Action</span>
                  <span className="text-xs">✦</span>
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
