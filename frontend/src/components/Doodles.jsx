import React from 'react'

// Organic wave divider inspired by the reference banner header
export function WaveHeader({ fill = '#494269', className = '' }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-8 sm:h-12 md:h-16 preserve-3d"
        preserveAspectRatio="none"
      >
        <path
          d="M0,32 C240,64 480,10 720,40 C960,70 1200,16 1440,36 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}

// Hand-drawn doodle underlines for expressive editorial headings
export function DoodleUnderline({ className = 'text-[#E6B95F]' }) {
  return (
    <svg
      viewBox="0 0 240 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-3 max-w-[240px] ${className}`}
      aria-hidden="true"
    >
      <path
        d="M3 14C55 5 130 3 237 13C175 7 90 9 20 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Playful sparkle/star accent
export function DoodleSparkle({ size = 20, className = 'text-[#E6B95F]' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path d="M12 0C12.5 6 18 11.5 24 12C18 12.5 12.5 18 12 24C11.5 18 6 12.5 0 12C6 11.5 11.5 6 12 0Z" />
    </svg>
  )
}

// Hand-drawn circle highlight for important stats
export function DoodleCircle({ children, className = '' }) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        viewBox="0 0 110 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute -inset-x-3 -inset-y-1.5 h-[calc(100%+12px)] w-[calc(100%+24px)] text-[#E6B95F]"
        aria-hidden="true"
      >
        <path
          d="M5 28C8 12 40 4 82 7C105 9 108 24 100 38C90 51 45 54 16 48C4 44 2 34 8 22C12 14 26 8 46 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

// Small illustrated customer avatar badge (as seen in the reference phone card)
export function DoodleAvatar({ id = 1, size = 32, className = '' }) {
  const backgrounds = ['#EBC69F', '#A99BB9', '#F4D3B5', '#E6B95F', '#5C5482']
  const bg = backgrounds[(id || 1) % backgrounds.length]
  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg }}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-[#FFF3E4] shadow-sm shrink-0 ${className}`}
      title={`Customer ${id}`}
    >
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full text-[#291C2E]">
        <circle cx="16" cy="11" r="5" fill="currentColor" opacity="0.85" />
        <path
          d="M7 28C7 22 11 19 16 19C21 19 25 22 25 28"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
    </div>
  )
}

// Hand-drawn arrow pointing to an action
export function DoodleArrow({ className = 'text-[#E6B95F]' }) {
  return (
    <svg
      width="38"
      height="26"
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 16C16 15 32 17 42 12M42 12L32 6M42 12L35 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

