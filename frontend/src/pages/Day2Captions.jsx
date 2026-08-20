import { useState } from 'react'
import { Image } from 'lucide-react'
import { useJson } from '../hooks/useStream'
import { PageHeader, CopyButton, FormField, ActionRow, Loader, ErrorMsg } from '../components/UI'

const PLATFORM_COLORS = {
  Instagram: { color: '#E1306C', bg: 'rgba(225,48,108,0.08)', border: 'rgba(225,48,108,0.2)' },
  LinkedIn: { color: '#0077B5', bg: 'rgba(0,119,181,0.08)', border: 'rgba(0,119,181,0.2)' },
  General: { color: 'var(--gold)', bg: 'var(--gold-dim)', border: 'rgba(255,209,102,0.2)' },
}

const PLATFORM_EMOJIS = { Instagram: '📸', LinkedIn: '💼', General: '🌐' }

export default function Day2Captions() {
  const [input, setInput] = useState('')
  const { data, loading, error, fetch } = useJson()

  const run = () => {
    if (!input.trim()) return
    fetch('/api/captions', { topic: input })
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 2 · Task 3"
        tagClass="tag-mint"
        title="AI Caption Generator"
        desc="One topic. Three platform-perfect captions — Instagram, LinkedIn, General."
        icon={Image}
      />

      <div className="card card-glow-mint" style={{ marginBottom: 20 }}>
        <FormField label="Topic or Description">
          <input
            className="input-base"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="e.g. 'launching my new AI product', 'sustainable travel tips'…"
          />
        </FormField>
        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading || !input.trim()}>
            <Image size={14} />
            {loading ? 'Generating…' : 'Generate Captions'}
          </button>
        </ActionRow>
      </div>

      {loading && (
        <div className="card"><Loader /></div>
      )}
      <ErrorMsg msg={error} />

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.map(({ platform, caption }) => {
            const c = PLATFORM_COLORS[platform] || PLATFORM_COLORS.General
            return (
              <div key={platform} className="card" style={{
                border: `1px solid ${c.border}`,
                background: c.bg,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>{PLATFORM_EMOJIS[platform]}</span>
                    <span style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                      color: c.color,
                    }}>{platform}</span>
                  </div>
                  <CopyButton text={caption} label="Copy Caption" />
                </div>
                <p style={{ fontSize: '0.93rem', lineHeight: 1.65, color: 'var(--text)' }}>{caption}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
