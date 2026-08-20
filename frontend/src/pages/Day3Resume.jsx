import { useState } from 'react'
import { Briefcase, RefreshCw } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, CopyButton, FormField, ActionRow, Loader } from '../components/UI'

export default function Day3Resume() {
  const [input, setInput] = useState('')
  const { text, loading, error, stream, reset } = useStream()

  const run = async () => {
    if (!input.trim()) return
    reset()
    await stream('/api/resume', { resume_text: input })
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 3 · Task 2"
        tagClass="tag-gold"
        title="AI Resume Booster"
        desc="Paste raw bullet points or skills. See them transformed into powerful, impactful statements."
        icon={Briefcase}
      />

      <div className="card card-glow-gold" style={{ marginBottom: 20 }}>
        <FormField label="Your Resume Points or Skills">
          <textarea
            className="input-base"
            rows={7}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Paste raw resume points, e.g.:\n• built a website\n• know python and react\n• worked on machine learning projects\n• helped with customer support`}
          />
        </FormField>
        <ActionRow>
          <button className="btn-brand" onClick={run} disabled={loading || !input.trim()}>
            <Briefcase size={14} />
            {loading ? 'Boosting…' : 'Boost My Resume'}
          </button>
          {text && (
            <button className="btn-ghost" onClick={run} disabled={loading}>
              <RefreshCw size={13} />
              Regenerate
            </button>
          )}
        </ActionRow>
      </div>

      {loading && !text && <div className="card"><Loader /></div>}

      {(text || (loading && text)) && (
        <div className="compare-grid" style={{ marginBottom: 16 }}>
          <div>
            <div style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--coral)', marginBottom: 8,
              fontFamily: 'Syne, sans-serif',
            }}>⚠️ Before (Raw)</div>
            <div className="output-box coral-border" style={{ color: 'var(--text-dim)', fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>
              {input}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--mint)', marginBottom: 8,
              fontFamily: 'Syne, sans-serif',
            }}>✦ After (Boosted)</div>
            <div className={`output-box mint-border ${loading ? 'streaming' : ''}`} style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>
              {text}
            </div>
          </div>
        </div>
      )}

      {text && !loading && (
        <ActionRow>
          <CopyButton text={text} label="Copy Boosted Resume" />
        </ActionRow>
      )}

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,107,107,0.08)',
          border: '1px solid rgba(255,107,107,0.2)',
          color: 'var(--coral)', fontSize: '0.85rem',
        }}>⚠️ {error}</div>
      )}
    </div>
  )
}
