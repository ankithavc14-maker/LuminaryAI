import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Bot, User, Sparkles } from 'lucide-react'
import { PageHeader, CopyButton } from '../components/UI'
import ReactMarkdown from 'react-markdown'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export default function Day1Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content:
        "Hey! I'm your Gemini AI assistant. Ask me anything — code, ideas, explanations, creative writing… I'm ready. 🚀",
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()

    if (!text || loading) return

    setInput('')

    const history = messages
      .filter((m, index) => m.role !== 'ai' || index > 0)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))

    const userMsg = {
      role: 'user',
      content: text,
    }

    const aiMsg = {
      role: 'ai',
      content: '',
    }

    setMessages((prev) => [...prev, userMsg, aiMsg])
    setLoading(true)

    if (abortRef.current) {
      abortRef.current.abort()
    }

    abortRef.current = new AbortController()

    try {
      const apiUrl = `${API_BASE}/api/chat`

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history,
          provider: 'gemini',
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.detail || `HTTP ${res.status}: Request failed`
        )
      }

      if (!res.body) {
        throw new Error('No response body received from the server.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let full = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        full += decoder.decode(value, { stream: true })

        setMessages((prev) => {
          const copy = [...prev]

          copy[copy.length - 1] = {
            role: 'ai',
            content: full,
          }

          return copy
        })
      }

      // Flush any remaining decoded characters
      full += decoder.decode()

      setMessages((prev) => {
        const copy = [...prev]

        copy[copy.length - 1] = {
          role: 'ai',
          content: full || 'No response received.',
        }

        return copy
      })
    } catch (e) {
      if (e.name === 'AbortError') {
        return
      }

      setMessages((prev) => {
        const copy = [...prev]

        copy[copy.length - 1] = {
          role: 'ai',
          content: `⚠️ Error: ${e.message || 'Something went wrong'}`,
        }

        return copy
      })
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setMessages([
      {
        role: 'ai',
        content:
          "Chat cleared! Let's start fresh — what's on your mind?",
      },
    ])
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 1 · Task 1 & 3"
        tagClass="tag-coral"
        title="AI Chatbot"
        desc="Conversational AI with full history. Stream responses in real time."
        icon={Bot}
      />

      <div
        className="card card-glow-coral"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={13} color="#0d0d0d" />
            </div>

            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Gemini Assistant
            </span>

            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--mint)',
                boxShadow: '0 0 6px var(--mint)',
              }}
            />
          </div>

          <button
            className="btn-ghost"
            onClick={clear}
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
            }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            height: 420,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection:
                  msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flexShrink: 0,
                  background:
                    msg.role === 'user'
                      ? 'var(--gradient-brand)'
                      : 'var(--surface3)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {msg.role === 'user' ? (
                  <User size={13} color="#0d0d0d" />
                ) : (
                  <Bot size={13} color="var(--mint)" />
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  maxWidth: '75%',
                }}
              >
                <div
                  className={`chat-bubble ${
                    msg.role === 'user' ? 'user' : 'ai'
                  } ${
                    i === messages.length - 1 &&
                    loading &&
                    msg.role === 'ai'
                      ? 'streaming'
                      : ''
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div
                      className="md-output"
                      style={{
                        fontSize: '0.88rem',
                      }}
                    >
                      <ReactMarkdown>
                        {msg.content || '▋'}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {msg.role === 'ai' && msg.content && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <CopyButton
                      text={msg.content}
                      label="Copy"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 10,
          }}
        >
          <textarea
            className="input-base"
            style={{
              margin: 0,
              resize: 'none',
              height: 44,
              overflowY: 'hidden',
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey
              ) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          />

          <button
            className="btn-brand"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              padding: '10px 18px',
              opacity:
                loading || !input.trim() ? 0.5 : 1,
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Tip */}
      <div
        style={{
          marginTop: 16,
          padding: '12px 16px',
          borderRadius: 12,
          background: 'var(--coral-dim)',
          border:
            '1px solid rgba(255,107,107,0.15)',
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
        }}
      >
        💡{' '}
        <strong
          style={{
            color: 'var(--coral)',
          }}
        >
          Tip:
        </strong>{' '}
        The chatbot remembers your conversation.
        Ask follow-up questions naturally!
      </div>
    </div>
  )
}