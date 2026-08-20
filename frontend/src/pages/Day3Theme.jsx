import { useState } from 'react'
import { Palette, Copy, Check } from 'lucide-react'
import { useJson } from '../hooks/useStream'
import { PageHeader, FormField, ActionRow, Loader, ErrorMsg } from '../components/UI'

function ColorSwatch({ name, hex }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div onClick={copy} title={`${name}: ${hex}`} style={{ cursor: 'pointer', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 16,
        background: hex,
        border: '2px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.15s, box-shadow 0.15s',
        marginBottom: 6,
        boxShadow: `0 4px 20px ${hex}40`,
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {copied && <Check size={20} color="white" strokeWidth={3} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />}
      </div>
      <div style={{ fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', color: 'var(--text-dim)' }}>{hex}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{name}</div>
    </div>
  )
}

export default function Day3Theme() {
  const [input, setInput] = useState('')
  const [applied, setApplied] = useState(false)
  const { data, loading, error, fetch } = useJson()

  const run = () => {
    if (!input.trim()) return
    setApplied(false)
    fetch('/api/theme', { description: input })
  }

  const applyTheme = () => {
    if (!data) return
    const root = document.documentElement
    const primary = data.palette.find(p => p.name === 'Primary')?.hex
    const secondary = data.palette.find(p => p.name === 'Secondary')?.hex
    const accent = data.palette.find(p => p.name === 'Accent')?.hex
    const bg = data.palette.find(p => p.name === 'Background')?.hex
    if (primary) root.style.setProperty('--coral', primary)
    if (secondary) root.style.setProperty('--mint', secondary)
    if (accent) root.style.setProperty('--gold', accent)
    if (bg) root.style.setProperty('--bg', bg)
    setApplied(true)
  }

  const resetTheme = () => {
    const root = document.documentElement
    root.style.removeProperty('--coral')
    root.style.removeProperty('--mint')
    root.style.removeProperty('--gold')
    root.style.removeProperty('--bg')
    setApplied(false)
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 3 · Task 3"
        tagClass="tag-gold"
        title="AI Theme Suggestions"
        desc="Describe your project. Get a full color palette, font pairings, and visual style — live."
        icon={Palette}
      />

      <div className="card card-glow-gold" style={{ marginBottom: 20 }}>
        <FormField label="Project or Brand Description">
          <input
            className="input-base"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="e.g. 'modern fintech app', 'kids educational platform', 'luxury jewellery brand'…"
          />
        </FormField>
        <ActionRow>
          <button className="btn-brand" onClick={run} disabled={loading || !input.trim()}>
            <Palette size={14} />
            {loading ? 'Designing…' : 'Suggest Theme'}
          </button>
        </ActionRow>
      </div>

      {loading && <div className="card"><Loader /></div>}
      <ErrorMsg msg={error} />

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Swatches */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
              color: 'var(--text-dim)', marginBottom: 20,
            }}>Color Palette</div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {data.palette.map(c => <ColorSwatch key={c.name} {...c} />)}
            </div>
          </div>

          {/* Fonts + Style */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif', color: 'var(--text-dim)', marginBottom: 14 }}>Typography</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HEADING</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gold)' }}>{data.fonts?.heading}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BODY</div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text)' }}>{data.fonts?.body}</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif', color: 'var(--text-dim)', marginBottom: 14 }}>Style Notes</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: 10 }}>{data.style}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{data.reasoning}</p>
            </div>
          </div>

          {/* Live apply */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-brand" onClick={applyTheme} disabled={applied}>
              {applied ? '✓ Theme Applied!' : '🎨 Apply to This Page'}
            </button>
            {applied && (
              <button className="btn-ghost" onClick={resetTheme}>
                Reset Theme
              </button>
            )}
          </div>
          {applied && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--mint-dim)', border: '1px solid rgba(0,245,196,0.2)',
              fontSize: '0.8rem', color: 'var(--text-dim)',
            }}>
              ✨ Theme applied live! The page colors have changed. Click Reset to restore.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
