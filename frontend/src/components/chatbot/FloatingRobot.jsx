import React, { useState } from 'react'

export default function FloatingRobot({ onClick, isOpen }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-end gap-3 select-none pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Speech Prompt Badge */}
      {!isOpen && (
        <div
          onClick={onClick}
          className={`cursor-pointer transition-all duration-300 transform ${
            isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-90 translate-y-1 scale-95'
          } hidden sm:flex items-center gap-2 rounded-2xl border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-2 text-xs font-semibold text-[#291C2E] shadow-[0_8px_20px_rgba(41,28,46,0.14)] backdrop-blur-md`}
        >
          <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Ask ChurnGuard AI</span>
          <span className="text-[#E6B95F] text-xs">✦</span>
        </div>
      )}

      {/* Floating 3D AI Robot Mascot Trigger */}
      <button
        type="button"
        onClick={onClick}
        aria-label={isOpen ? 'Minimize AI Assistant' : 'Open ChurnGuard AI Assistant'}
        className="group relative flex size-16 sm:size-18 items-center justify-center rounded-full p-1 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none"
      >
        {/* Soft Ambient Gold Aura Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E6B95F]/35 via-[#F4D3B5]/25 to-transparent blur-md group-hover:blur-lg transition-all" />

        {/* Outer Champagne Metallic Border Ring */}
        <div className="relative flex size-full items-center justify-center rounded-full border-2 border-[#EBC69F] bg-gradient-to-br from-[#FFF8ED] via-[#FFF3E4] to-[#F4D3B5] shadow-[0_12px_28px_rgba(41,28,46,0.22)]">
          
          {/* Animated 3D-Style AI Robot SVG */}
          <svg
            viewBox="0 0 100 100"
            className="size-12 sm:size-14 transform transition-transform duration-300 group-hover:-translate-y-1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Robot Floating Shadow */}
            <ellipse cx="50" cy="92" rx="20" ry="4" fill="#291C2E" fillOpacity="0.18" />

            {/* Antenna Pole & Glowing Gold Orb */}
            <path d="M50 22V12" stroke="#EBC69F" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="10" r="5" fill="url(#antennaGlow)" />
            <circle cx="50" cy="10" r="2.5" fill="#FFF3E4" />

            {/* Robot Head Outer Shell (Deep Plum to Aubergine Gradient) */}
            <rect
              x="22"
              y="22"
              width="56"
              height="44"
              rx="18"
              fill="url(#headGradient)"
              stroke="#EBC69F"
              strokeWidth="2.5"
            />

            {/* Digital Screen Visor (Glassmorphic Dark Interior) */}
            <rect
              x="28"
              y="28"
              width="44"
              height="32"
              rx="12"
              fill="#1F1523"
              stroke="#373152"
              strokeWidth="1.5"
            />

            {/* Glowing Digital Expressive Eyes with Blink Keyframes */}
            <g className="animate-pulse">
              <rect x="36" y="38" width="8" height="11" rx="4" fill="#E6B95F" />
              <rect x="56" y="38" width="8" height="11" rx="4" fill="#E6B95F" />
              {/* Specular White Catchlight */}
              <circle cx="39" cy="41" r="1.5" fill="#FFFFFF" />
              <circle cx="59" cy="41" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Soft Peach Cheek Blush */}
            <circle cx="34" cy="52" r="3" fill="#F4D3B5" fillOpacity="0.4" />
            <circle cx="66" cy="52" r="3" fill="#F4D3B5" fillOpacity="0.4" />

            {/* Friendly Digital Smile Line */}
            <path
              d="M45 52Q50 56 55 52"
              stroke="#E6B95F"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Robot Torso Base */}
            <path
              d="M34 68C34 64 42 63 50 63C58 63 66 64 66 68L68 82C68 85 60 87 50 87C40 87 32 85 32 82L34 68Z"
              fill="url(#torsoGradient)"
              stroke="#EBC69F"
              strokeWidth="2"
            />

            {/* Central Chest Energy Shield */}
            <circle cx="50" cy="74" r="4.5" fill="#E6B95F" fillOpacity="0.9" />
            <circle cx="50" cy="74" r="2" fill="#FFFFFF" />

            {/* SVG Linear & Radial Gradients */}
            <defs>
              <linearGradient id="headGradient" x1="22" y1="22" x2="78" y2="66" gradientUnits="userSpaceOnUse">
                <stop stopColor="#373152" />
                <stop offset="1" stopColor="#291C2E" />
              </linearGradient>
              <linearGradient id="torsoGradient" x1="32" y1="63" x2="68" y2="87" gradientUnits="userSpaceOnUse">
                <stop stopColor="#373152" />
                <stop offset="1" stopColor="#291C2E" />
              </linearGradient>
              <radialGradient id="antennaGlow" cx="50" cy="10" r="5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F3C66F" />
                <stop offset="1" stopColor="#E6B95F" />
              </radialGradient>
            </defs>
          </svg>

          {/* Mini Status Notification Pill */}
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#E6B95F] text-[9px] font-black text-[#291C2E] shadow-sm">
            ✦
          </span>
        </div>
      </button>
    </div>
  )
}
