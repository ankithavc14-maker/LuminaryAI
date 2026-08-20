import { useState } from 'react'
import { Mic } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, FormField } from '../components/UI'

const TONES = [
  { key: 'Professional', emoji: '💼', desc: 'Clear, confident, business-ready' },
  { key: 'Friendly', emoji: '😊', desc: 'Warm, conversational, approachable' },
  { key: 'Formal', emoji: '🎩', desc: 'Highly formal, executive-level' },
  { key: 'Casual', emoji: '😎', desc: 'Relaxed, everyday language' },
]

export default function Day2Tone() {
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('Professional')
  const { text, loading, error, stream, reset } = useStream()

  const run = async () => {
    if (!input.trim()) return
    reset()
    await stream('/api/tone', { text: input, tone })
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 2 · Task 2"
        tagClass="tag-mint"
        title="AI Tone Converter"
        desc="Switch the tone of any text without changing its meaning."
        icon={Mic}
      />

      <div className="card card-glow-mint" style={{ marginBottom: 16 }}>
        <FormField label="Original Text">
          <textarea
            className="input-base"
            rows={5}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste any text here — email, message, announcement…"
          />
        </FormField>

        {/* Tone selector */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px',
            textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
            color: 'var(--text-dim)', marginBottom: 10,
          }}>Choose Tone</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {TONES.map(t => (
              <button
                key={t.key}
                onClick={() => setTone(t.key)}
                style={{
                  padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${tone === t.key ? 'rgba(0,245,196,0.4)' : 'var(--border)'}`,
                  background: tone === t.key ? 'var(--mint-dim)' : 'var(--surface2)',
                  transition: 'all 0.2s', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{t.emoji}</div>
                <div style={{
                  fontSize: '0.78rem', fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  color: tone === t.key ? 'var(--mint)' : 'var(--text)',
                }}>{t.key}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading || !input.trim()}>
            <Mic size={14} />
            {loading ? `Converting to ${tone}…` : `Convert to ${tone}`}
          </button>
          {text && <CopyButton text={text} />}
        </ActionRow>
      </div>

      {text && (
        <div className="compare-grid">
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
              Before
            </div>
            <div className="output-box" style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
              {input}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--mint)', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
              After — {tone} ✦
            </div>
            <div className={`output-box mint-border ${loading ? 'streaming' : ''}`}>
              {text}
            </div>
          </div>
        </div>
      )}

      <OutputBox text={!text ? text : ''} loading={loading && !text} error={error} />
    </div>
  )
}
