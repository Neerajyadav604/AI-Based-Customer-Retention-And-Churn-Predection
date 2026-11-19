import React, { useState, useEffect, useCallback } from 'react'
import FloatingRobot from './FloatingRobot'
import ChatbotPanel from './ChatbotPanel'
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  getChatSuggestions,
} from '../../api'

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [suggestions, setSuggestions] = useState([
    '🔍 How many customers are at high risk?',
    '📊 Explain RFM scoring methodology',
    '💡 What retention playbooks are recommended?',
    '📁 What CSV format do I need for bulk predictions?',
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Retrieve or initialize session identifier
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('churnguard_chat_session')
    if (!sid) {
      sid = `cg_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      sessionStorage.setItem('churnguard_chat_session', sid)
    }
    return sid
  })

  // Load initial suggestions and previous session history
  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [historyRes, sugRes] = await Promise.allSettled([
          getChatHistory(sessionId),
          getChatSuggestions(),
        ])

        if (isMounted) {
          if (historyRes.status === 'fulfilled' && historyRes.value?.history) {
            setMessages(historyRes.value.history)
          }
          if (sugRes.status === 'fulfilled' && sugRes.value?.suggestions) {
            setSuggestions(sugRes.value.suggestions)
          }
        }
      } catch (err) {
        console.warn('[CHATBOT WIDGET] Could not load initial state:', err)
      }
    }

    loadInitialData()
    return () => {
      isMounted = false
    }
  }, [sessionId])

  const handleSendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isLoading) return

      const userMsg = { role: 'user', content: text.trim() }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      try {
        const res = await sendChatMessage(text.trim(), sessionId)
        const botMsg = {
          role: 'assistant',
          content: res.reply || 'Analysis complete.',
          sources: res.sources || [],
          intent: res.intent,
        }
        setMessages((prev) => [...prev, botMsg])
        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions)
        }
      } catch (err) {
        console.error('[CHATBOT ERROR]', err)
        const fallbackMsg = {
          role: 'assistant',
          content:
            "I'm temporarily having trouble connecting to the analytics engine. Please ensure your backend is online or try asking your question again in a moment.",
          sources: [],
        }
        setMessages((prev) => [...prev, fallbackMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, isLoading]
  )

  const handleClear = useCallback(async () => {
    try {
      await clearChatHistory(sessionId)
    } catch (e) {
      console.warn('Clear history failed:', e)
    }
    setMessages([])
  }, [sessionId])

  return (
    <>
      {/* Floating Robot Mascot (Bottom-Right Anchor) */}
      <FloatingRobot onClick={() => setIsOpen((prev) => !prev)} isOpen={isOpen} />

      {/* Expanded Floating Chat Panel */}
      <ChatbotPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearHistory={handleClear}
        suggestions={suggestions}
        isLoading={isLoading}
      />
    </>
  )
}
