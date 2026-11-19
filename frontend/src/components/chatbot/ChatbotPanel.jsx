import React, { useState, useEffect, useRef } from 'react'

export default function ChatbotPanel({
  isOpen,
  onClose,
  onMinimize,
  messages,
  onSendMessage,
  onClearHistory,
  suggestions,
  isLoading,
}) {
  const [inputText, setInputText] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, isLoading])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isLoading) return
    onSendMessage(trimmed)
    setInputText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Simple Markdown text formatter for responses
  function renderFormattedContent(text) {
    if (!text) return null

    // Split paragraphs
    const paragraphs = text.split('\n\n')
    return (
      <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
        {paragraphs.map((para, pIdx) => {
          // Headers
          if (para.startsWith('### ')) {
            return (
              <h4 key={pIdx} className="font-editorial text-sm sm:text-base font-bold text-[#291C2E] mt-1 mb-1">
                {para.replace('### ', '')}
              </h4>
            )
          }
          if (para.startsWith('## ')) {
            return (
              <h3 key={pIdx} className="font-editorial text-base sm:text-lg font-bold text-[#291C2E] mt-1 mb-1">
                {para.replace('## ', '')}
              </h3>
            )
          }

          // Bullet lists
          const lines = para.split('\n')
          const isList = lines.some((l) => l.trim().startsWith('•') || l.trim().startsWith('-'))
          if (isList) {
            return (
              <ul key={pIdx} className="space-y-1 pl-1">
                {lines.map((line, lIdx) => {
                  const cleaned = line.replace(/^[•\-]\s*/, '')
                  return (
                    <li key={lIdx} className="flex items-start gap-1.5">
                      <span className="text-[#E6B95F] font-bold text-xs mt-0.5">•</span>
                      <span>{renderInlineMarkdown(cleaned)}</span>
                    </li>
                  )
                })}
              </ul>
            )
          }

          return <p key={pIdx}>{renderInlineMarkdown(para)}</p>
        })}
      </div>
    )
  }

  function renderInlineMarkdown(str) {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#291C2E]">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="rounded-md bg-[#FFF3E4] border border-[#EBC69F]/80 px-1 py-0.5 font-mono text-xs text-[#291C2E]">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  return (
    <div
      className={`fixed z-50 flex flex-col overflow-hidden rounded-3xl border-2 border-[#EBC69F] bg-[#FFF8ED] shadow-[0_24px_65px_-12px_rgba(41,28,46,0.38)] backdrop-blur-xl transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5 ${
        isMaximized
          ? 'bottom-4 sm:bottom-6 right-2 sm:right-6 md:right-8 w-[96vw] sm:w-[860px] md:w-[940px] lg:w-[1040px] h-[88vh] max-h-[92vh]'
          : 'bottom-6 right-3 sm:right-6 w-[92vw] sm:w-[440px] h-[600px] max-h-[84vh]'
      }`}
      role="dialog"
      aria-label="ChurnGuard AI Chatbot Assistant"
    >
      {/* ========================================================
          1. HEADER (Deep Plum / Aubergine with Gold Details)
          ======================================================== */}
      <div className="flex items-center justify-between border-b border-[#EBC69F] bg-gradient-to-r from-[#291C2E] via-[#373152] to-[#291C2E] px-4 py-3.5 text-[#FFF3E4]">
        <div className="flex items-center gap-3">
          {/* Robot Mini Avatar */}
          <div className="relative flex size-9 items-center justify-center rounded-xl border border-[#EBC69F]/60 bg-[#1F1523] text-[#E6B95F] shadow-xs">
            <span className="text-base">🤖</span>
            <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial text-sm sm:text-base font-bold text-[#FFF3E4]">
                ChurnGuard AI
              </h3>
              <span className="rounded-full bg-[#E6B95F]/20 border border-[#E6B95F]/40 px-2 py-0.2 text-[9px] font-bold text-[#E6B95F] uppercase">
                v1.8
              </span>
            </div>
            <p className="text-[10px] text-[#F4D3B5]/80 flex items-center gap-1">
              <span>● Online</span>
              <span>• Customer Retention Intelligence</span>
            </p>
          </div>
        </div>

        {/* Controls: Clear, Maximize/Restore, Minimize, Close */}
        <div className="flex items-center gap-1 text-[#F4D3B5]">
          <button
            type="button"
            onClick={onClearHistory}
            title="Clear Chat History"
            className="flex size-7 items-center justify-center rounded-lg hover:bg-white/10 hover:text-[#FFF3E4] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
          
          {/* Maximize / Restore Button */}
          <button
            type="button"
            onClick={() => setIsMaximized((prev) => !prev)}
            title={isMaximized ? "Restore window size" : "Maximize window"}
            className="flex size-7 items-center justify-center rounded-lg hover:bg-white/10 hover:text-[#FFF3E4] transition"
          >
            {isMaximized ? (
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
                <rect x="4" y="8" width="12" height="12" rx="2" />
                <path d="M8 4h10a2 2 0 012 2v10" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5 stroke-current stroke-2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onMinimize}
            title="Minimize"
            className="flex size-7 items-center justify-center rounded-lg hover:bg-white/10 hover:text-[#FFF3E4] transition font-bold"
          >
            —
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="flex size-7 items-center justify-center rounded-lg hover:bg-white/10 hover:text-[#FFF3E4] transition text-base"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MESSAGE HISTORY BODY
          ======================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FFF8ED] to-[#FFF3E4]">
        {/* Welcome Banner if empty or start */}
        {messages.length === 0 && (
          <div className="rounded-2xl border border-[#EBC69F] bg-white p-4 text-center shadow-xs space-y-2">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[#291C2E] text-[#E6B95F] text-lg shadow-xs">
              ✦
            </div>
            <h4 className="font-editorial text-sm font-bold text-[#291C2E]">
              Welcome to ChurnGuard AI Assistant!
            </h4>
            <p className="text-xs text-[#392D35] leading-relaxed">
              I analyze customer churn risk, explain RFM metrics, provide prescriptive retention playbooks, and inspect your uploaded transaction datasets.
            </p>
          </div>
        )}

        {/* Dynamic Conversation Messages */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[86%] p-3.5 rounded-2xl shadow-xs transition-all ${
                msg.role === 'user'
                  ? 'bg-[#291C2E] text-[#FFF3E4] rounded-tr-xs'
                  : 'bg-white border border-[#EBC69F] text-[#291C2E] rounded-tl-xs'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div>{renderFormattedContent(msg.content)}</div>
              )}
            </div>

            {/* Optional Sources badge for assistant */}
            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#716982] pl-1">
                <span>✦ Verified from:</span>
                <span className="font-medium text-[#291C2E]">{msg.sources.join(' • ')}</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-1.5 rounded-2xl border border-[#EBC69F] bg-white px-4 py-3 w-fit shadow-xs">
            <span className="size-2 rounded-full bg-[#E6B95F] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="size-2 rounded-full bg-[#E6B95F] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="size-2 rounded-full bg-[#E6B95F] animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-[#716982] font-medium ml-1">Analyzing retention telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================
          3. QUICK SUGGESTION CHIPS
          ======================================================== */}
      {suggestions && suggestions.length > 0 && !isLoading && (
        <div className="px-3 py-2 bg-[#FFF8ED] border-t border-[#EBC69F]/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(sug)}
              className="shrink-0 rounded-full border border-[#EBC69F] bg-white px-3 py-1 text-[11px] font-medium text-[#291C2E] shadow-2xs hover:border-[#E6B95F] hover:bg-[#FFF3E4] transition cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================
          4. CHAT INPUT FOOTER
          ======================================================== */}
      <form onSubmit={handleSubmit} className="border-t border-[#EBC69F] bg-white p-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about churn, RFM, or your dataset..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-[#EBC69F] bg-[#FFF8ED] px-3.5 py-2.5 text-xs sm:text-sm text-[#291C2E] placeholder-[#716982] focus:border-[#291C2E] focus:bg-white focus:outline-none transition"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="glow-gold-btn flex size-10 shrink-0 items-center justify-center rounded-xl text-[#291C2E] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 ml-0.5">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
