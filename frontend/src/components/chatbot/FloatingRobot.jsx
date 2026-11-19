import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function FloatingRobot({ onClick, isOpen }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWhirling, setIsWhirling] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  
  // Custom position state if manually dragged; null preserves default bottom-right anchoring
  const [coords, setCoords] = useState(null)
  
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    elemX: 0,
    elemY: 0,
    hasMoved: false,
    active: false,
  })

  const containerRef = useRef(null)

  // 1. Initial 360-degree whirl animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWhirling(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Keep manually dragged position within viewport if window is resized
  useEffect(() => {
    function handleResize() {
      setCoords((prev) => {
        if (!prev) return null
        return {
          x: Math.max(16, Math.min(window.innerWidth - 88, prev.x)),
          y: Math.max(16, Math.min(window.innerHeight - 88, prev.y)),
        }
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 2. Drag Interaction Handlers (Mouse & Touch)
  const handlePointerDown = useCallback((e) => {
    // Left mouse click or touch only
    if (e.button && e.button !== 0) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      elemX: rect.left,
      elemY: rect.top,
      hasMoved: false,
      active: true,
    }

    setIsDragging(true)
  }, [])

  useEffect(() => {
    function handlePointerMove(e) {
      if (!dragRef.current.active) return

      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      const deltaX = clientX - dragRef.current.startX
      const deltaY = clientY - dragRef.current.startY

      if (Math.hypot(deltaX, deltaY) > 5) {
        dragRef.current.hasMoved = true
      }

      // Constrain strictly within the visible viewport bounds
      const robotSize = 80
      const newX = Math.max(16, Math.min(window.innerWidth - robotSize - 16, dragRef.current.elemX + deltaX))
      const newY = Math.max(16, Math.min(window.innerHeight - robotSize - 16, dragRef.current.elemY + deltaY))

      setCoords({ x: newX, y: newY })
    }

    function handlePointerUp() {
      if (!dragRef.current.active) return

      const wasDrag = dragRef.current.hasMoved
      dragRef.current.active = false
      setIsDragging(false)

      // Only trigger chatbot if it was a click, NOT a drag
      if (!wasDrag) {
        onClick()
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true })
      window.addEventListener('mouseup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove, { passive: true })
      window.addEventListener('touchend', handlePointerUp)
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, onClick])

  // When chatbot panel is open, hide the floating robot trigger so it does not overlap
  if (isOpen) return null

  // Determine speech badge position (flips left or right based on viewport side)
  const isRightSide = !coords || coords.x > window.innerWidth / 2

  const containerStyle = coords
    ? {
        position: 'fixed',
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        zIndex: 50,
      }
    : {}

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={`${
        coords ? '' : 'fixed bottom-6 right-6 z-50'
      } flex items-center select-none ${
        isRightSide ? 'flex-row-reverse' : 'flex-row'
      } gap-3 pointer-events-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating 3D AI Robot Mascot Trigger */}
      <div className="relative flex flex-col items-center">
        {/* Soft Ground Shadow that expands/contracts as robot floats */}
        <div
          className={`absolute -bottom-2 w-12 h-3 rounded-full bg-[#291C2E] blur-[2px] pointer-events-none transition-opacity ${
            isDragging ? 'opacity-10 scale-50' : 'animate-robot-shadow'
          }`}
        />

        <div
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          role="button"
          tabIndex={0}
          aria-label="ChurnGuard AI Assistant Mascot - Drag or Click"
          title="Drag anywhere on screen or click to chat"
          className={`group relative flex size-16 sm:size-18 items-center justify-center rounded-full p-1 transition-transform duration-200 ${
            isDragging
              ? 'cursor-grabbing scale-110 rotate-6 shadow-2xl'
              : 'cursor-grab hover:scale-105 active:scale-95'
          } focus:outline-none ${
            isWhirling
              ? 'animate-robot-whirl'
              : !isDragging
              ? 'animate-robot-float'
              : ''
          }`}
        >
          {/* Soft Ambient Gold Aura Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E6B95F]/45 via-[#F4D3B5]/30 to-transparent blur-md group-hover:blur-lg animate-robot-glow transition-all" />

          {/* Outer Champagne Metallic Border Ring */}
          <div className="relative flex size-full items-center justify-center rounded-full border-2 border-[#EBC69F] bg-gradient-to-br from-[#FFF8ED] via-[#FFF3E4] to-[#F4D3B5] shadow-[0_14px_32px_rgba(41,28,46,0.28)]">
            
            {/* Animated 3D-Style AI Robot SVG */}
            <svg
              viewBox="0 0 100 100"
              className="size-12 sm:size-14 transform transition-transform duration-300 group-hover:-translate-y-1 pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Antenna Pole & Glowing Gold Orb */}
              <path d="M50 22V11" stroke="#EBC69F" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="9" r="5" fill="url(#antennaGlow)" />
              <circle cx="50" cy="9" r="2.5" fill="#FFF3E4" />

              {/* Robot Head Outer Shell (Deep Plum to Aubergine Gradient) */}
              <rect
                x="22"
                y="20"
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
                y="26"
                width="44"
                height="32"
                rx="12"
                fill="#1F1523"
                stroke="#373152"
                strokeWidth="1.5"
              />

              {/* Glowing Digital Expressive Eyes with Blink Keyframes */}
              <g className="animate-robot-blink">
                <rect x="36" y="36" width="8" height="11" rx="4" fill="#E6B95F" />
                <rect x="56" y="36" width="8" height="11" rx="4" fill="#E6B95F" />
                {/* Specular White Catchlight */}
                <circle cx="39" cy="39" r="1.5" fill="#FFFFFF" />
                <circle cx="59" cy="39" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Soft Peach Cheek Blush */}
              <circle cx="34" cy="50" r="3" fill="#F4D3B5" fillOpacity="0.5" />
              <circle cx="66" cy="50" r="3" fill="#F4D3B5" fillOpacity="0.5" />

              {/* Friendly Digital Smile Line */}
              <path
                d="M45 50Q50 54 55 50"
                stroke="#E6B95F"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Robot Torso Base */}
              <path
                d="M34 66C34 62 42 61 50 61C58 61 66 62 66 66L68 80C68 83 60 85 50 85C40 85 32 83 32 80L34 66Z"
                fill="url(#torsoGradient)"
                stroke="#EBC69F"
                strokeWidth="2"
              />

              {/* Central Chest Energy Shield */}
              <circle cx="50" cy="72" r="4.5" fill="#E6B95F" fillOpacity="0.95" />
              <circle cx="50" cy="72" r="2" fill="#FFFFFF" />

              {/* SVG Linear & Radial Gradients */}
              <defs>
                <linearGradient id="headGradient" x1="22" y1="20" x2="78" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#373152" />
                  <stop offset="1" stopColor="#291C2E" />
                </linearGradient>
                <linearGradient id="torsoGradient" x1="32" y1="61" x2="68" y2="85" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#373152" />
                  <stop offset="1" stopColor="#291C2E" />
                </linearGradient>
                <radialGradient id="antennaGlow" cx="50" cy="9" r="5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F3C66F" />
                  <stop offset="1" stopColor="#E6B95F" />
                </radialGradient>
              </defs>
            </svg>

            {/* Mini Sparkle Pill */}
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#E6B95F] text-[9px] font-black text-[#291C2E] shadow-sm">
              ✦
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Speech Prompt Badge */}
      {!isDragging && (
        <div
          onClick={onClick}
          className={`cursor-pointer transition-all duration-300 transform ${
            isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-90 translate-y-0.5 scale-95'
          } hidden sm:flex items-center gap-2 rounded-2xl border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-2 text-xs font-semibold text-[#291C2E] shadow-[0_8px_24px_rgba(41,28,46,0.18)] backdrop-blur-md hover:border-[#E6B95F]`}
        >
          <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Ask ChurnGuard AI</span>
          <span className="text-[#E6B95F] text-xs">✦</span>
        </div>
      )}
    </div>
  )
}
