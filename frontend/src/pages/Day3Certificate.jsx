import { useState, useRef } from 'react'
import { Award, Download, RefreshCw, Palette } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, ActionRow, FormField, Loader } from '../components/UI'

const THEMES = [
  {
    id: 'classic',
    name: 'Classic Gold',
    bg: '#fffdf5',
    border: '#c9a84c',
    accent: '#8B6914',
    headerBg: 'linear-gradient(135deg, #8B6914 0%, #c9a84c 50%, #8B6914 100%)',
    textColor: '#2c1810',
    subtextColor: '#5a4020',
    pattern: 'classic',
  },
  {
    id: 'executive',
    name: 'Executive Navy',
    bg: '#f8f9ff',
    border: '#1a2744',
    accent: '#1a2744',
    headerBg: 'linear-gradient(135deg, #0f1b35 0%, #1a2744 50%, #2d4070 100%)',
    textColor: '#0f1b35',
    subtextColor: '#2d4070',
    pattern: 'executive',
  },
  {
    id: 'elegant',
    name: 'Elegant Rose',
    bg: '#fff8f8',
    border: '#c0506a',
    accent: '#8B1a35',
    headerBg: 'linear-gradient(135deg, #6b1228 0%, #c0506a 50%, #6b1228 100%)',
    textColor: '#3a0a15',
    subtextColor: '#6b1228',
    pattern: 'elegant',
  },
  {
    id: 'modern',
    name: 'Modern Slate',
    bg: '#f7f8fc',
    border: '#4a5568',
    accent: '#2d3748',
    headerBg: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
    textColor: '#1a202c',
    subtextColor: '#4a5568',
    pattern: 'modern',
  },
]

function Seal({ theme, companyName }) {
  const color = theme.accent
  const lightColor = theme.border
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Outer ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={lightColor} strokeWidth="1" strokeDasharray="3 2" />
      {/* Inner fill */}
      <circle cx="50" cy="50" r="38" fill={color} opacity="0.08" />
      {/* Star */}
      <polygon
        points="50,18 54,34 70,34 57,44 62,60 50,51 38,60 43,44 30,34 46,34"
        fill={color} opacity="0.85"
      />
      {/* Company text arc — top */}
      <path id="topArc" d="M 15,50 A 35,35 0 0,1 85,50" fill="none" />
      <text fontSize="7.5" fill={color} fontFamily="Syne, sans-serif" fontWeight="700" letterSpacing="1.5">
        <textPath href="#topArc" startOffset="10%">
          {(companyName || 'LUMINARY AI STUDIO').toUpperCase()}
        </textPath>
      </text>
      {/* Certified text arc — bottom */}
      <path id="botArc" d="M 15,50 A 35,35 0 0,0 85,50" fill="none" />
      <text fontSize="6.5" fill={color} fontFamily="DM Mono, monospace" letterSpacing="2">
        <textPath href="#botArc" startOffset="18%">
          ✦ CERTIFIED ✦
        </textPath>
      </text>
    </svg>
  )
}

function BorderPattern({ theme }) {
  const c = theme.border
  if (theme.pattern === 'classic') return (
    <>
      {/* Corner ornaments */}
      {[
        { top: 12, left: 12 }, { top: 12, right: 12 },
        { bottom: 12, left: 12 }, { bottom: 12, right: 12 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 40, height: 40,
          borderTop: i < 2 ? `3px solid ${c}` : 'none',
          borderBottom: i >= 2 ? `3px solid ${c}` : 'none',
          borderLeft: i % 2 === 0 ? `3px solid ${c}` : 'none',
          borderRight: i % 2 === 1 ? `3px solid ${c}` : 'none',
        }} />
      ))}
    </>
  )
  if (theme.pattern === 'executive') return (
    <>
      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, border: `1px solid ${c}`, borderRadius: 4, opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, border: `1px solid ${c}`, borderRadius: 2, opacity: 0.15 }} />
    </>
  )
  if (theme.pattern === 'elegant') return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute',
          top: 6 + i * 4, left: 6 + i * 4, right: 6 + i * 4, bottom: 6 + i * 4,
          border: `${i === 0 ? 2 : 0.5}px solid ${c}`,
          borderRadius: 2,
          opacity: i === 0 ? 0.7 : 0.25,
        }} />
      ))}
    </>
  )
  return (
    <div style={{
      position: 'absolute', top: 10, left: 10, right: 10, bottom: 10,
      border: `1.5px solid ${c}`, borderRadius: 6, opacity: 0.2,
    }} />
  )
}

function Certificate({ theme, form, text, loading, certRef }) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div
      ref={certRef}
      style={{
        position: 'relative',
        background: theme.bg,
        border: `3px solid ${theme.border}`,
        borderRadius: 8,
        padding: '52px 60px',
        minHeight: 480,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* Border patterns */}
      <BorderPattern theme={theme} />

      {/* Header ribbon */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 10,
        background: theme.headerBg,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 10,
        background: theme.headerBg,
      }} />

      {/* Top section */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        {/* Logo/Org name */}
        <div style={{
          fontSize: '0.7rem', fontFamily: 'Syne, sans-serif', fontWeight: 700,
          letterSpacing: '4px', textTransform: 'uppercase',
          color: theme.accent, marginBottom: 12,
        }}>
          ✦ Luminary AI Studio ✦
        </div>

        {/* Main title */}
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '2.2rem', fontWeight: 700,
          color: theme.accent,
          lineHeight: 1.1, marginBottom: 6,
          letterSpacing: '-0.01em',
        }}>
          Certificate of Completion
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, margin: '14px 0' }}>
          <div style={{ height: 1, width: 60, background: theme.border, opacity: 0.5 }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, opacity: 0.6 }} />
          <div style={{ height: 1, width: 60, background: theme.border, opacity: 0.5 }} />
        </div>

        <div style={{ fontSize: '0.82rem', color: theme.subtextColor, letterSpacing: '1px', fontStyle: 'italic' }}>
          This is to proudly certify that
        </div>
      </div>

      {/* Recipient name */}
      <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '2.4rem', fontWeight: 700, fontStyle: 'italic',
          color: theme.textColor,
          borderBottom: `2px solid ${theme.border}`,
          display: 'inline-block',
          paddingBottom: 6,
          minWidth: 200,
        }}>
          {form.name || 'Recipient Name'}
        </div>
      </div>

      {/* Course info */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '0.88rem', color: theme.subtextColor, marginBottom: 8 }}>
          has successfully completed
        </div>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '1.15rem', color: theme.accent,
          letterSpacing: '0.5px',
        }}>
          {form.course || 'Course Name'}
        </div>
        <div style={{ fontSize: '0.82rem', color: theme.subtextColor, marginTop: 4 }}>
          Duration: <strong>{form.duration || '—'}</strong>
        </div>
      </div>

      {/* AI-generated body text */}
      {(text || loading) && (
        <div style={{
          textAlign: 'center', margin: '16px auto',
          maxWidth: 520,
          fontSize: '0.88rem', lineHeight: 1.9,
          color: theme.subtextColor,
          fontStyle: 'italic',
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          padding: '16px 24px',
          opacity: 0.7,
        }} className={loading ? 'streaming' : ''}>
          {text || ''}
        </div>
      )}

      {/* Bottom: signature + seal */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginTop: 32, paddingTop: 16,
      }}>
        {/* Signature left */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
            fontSize: '1.3rem', color: theme.accent,
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: 4, marginBottom: 4, minWidth: 140,
          }}>
            {form.issuerName || 'Director'}
          </div>
          <div style={{ fontSize: '0.72rem', color: theme.subtextColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {form.issuerTitle || 'Program Director'}
          </div>
        </div>

        {/* Center: Seal */}
        <div style={{ opacity: 0.85 }}>
          <Seal theme={theme} companyName={form.company} />
        </div>

        {/* Date right */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
            fontSize: '1rem', color: theme.accent,
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: 4, marginBottom: 4, minWidth: 140,
          }}>
            {today}
          </div>
          <div style={{ fontSize: '0.72rem', color: theme.subtextColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Date of Issue
          </div>
        </div>
      </div>

      {/* Certificate ID */}
      <div style={{
        position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
        fontSize: '0.62rem', color: theme.subtextColor, fontFamily: 'DM Mono, monospace',
        letterSpacing: '1.5px', opacity: 0.5,
      }}>
        CERT-{Math.random().toString(36).substring(2, 10).toUpperCase()} · Issued by Luminary AI Studio
      </div>
    </div>
  )
}

export default function Day3Certificate() {
  const [form, setForm] = useState({
    name: '', course: '', duration: '',
    company: 'Luminary AI Studio',
    issuerName: 'Director', issuerTitle: 'Program Director',
  })
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [downloading, setDownloading] = useState(false)
  const { text, loading, error, stream, reset } = useStream()
  const certRef = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const run = async () => {
    const { name, course, duration } = form
    if (!name || !course || !duration) return alert('Please fill Name, Course, and Duration.')
    reset()
    await stream('/api/certificate', { name, course, duration })
  }

  const downloadPNG = async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js')).default
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: selectedTheme.bg,
      })
      const link = document.createElement('a')
      link.download = `Certificate_${form.name.replace(/\s+/g, '_')}_Luminary.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      alert('Download failed. Try right-clicking the certificate and saving as image.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Certificate Maker"
        tagClass="tag-gold"
        title="Professional Certificate Generator"
        desc="Create real, downloadable certificates with multiple themes and a company seal."
        icon={Award}
      />

      {/* Form */}
      <div className="card card-glow-gold" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Recipient Full Name">
            <input className="input-base" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arjun Sharma" />
          </FormField>
          <FormField label="Course / Achievement">
            <input className="input-base" value={form.course} onChange={e => set('course', e.target.value)} placeholder="e.g. AI Development Internship" />
          </FormField>
          <FormField label="Duration">
            <input className="input-base" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 4 Weeks" />
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
          <FormField label="Organisation / Company">
            <input className="input-base" value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Luminary AI Studio" />
          </FormField>
          <FormField label="Issuer Name">
            <input className="input-base" value={form.issuerName} onChange={e => set('issuerName', e.target.value)} placeholder="e.g. Sarah Johnson" />
          </FormField>
          <FormField label="Issuer Title">
            <input className="input-base" value={form.issuerTitle} onChange={e => set('issuerTitle', e.target.value)} placeholder="e.g. Program Director" />
          </FormField>
        </div>

        {/* Theme picker */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={12} /> Theme
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `2px solid ${selectedTheme.id === t.id ? t.border : 'var(--border)'}`,
                  background: selectedTheme.id === t.id ? `${t.bg}` : 'var(--surface2)',
                  color: selectedTheme.id === t.id ? t.accent : 'var(--text-dim)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <ActionRow>
          <button className="btn-brand" onClick={run} disabled={loading}>
            <Award size={14} />
            {loading ? 'Generating…' : 'Generate Certificate'}
          </button>
          {text && !loading && (
            <button className="btn-ghost" onClick={run}>
              <RefreshCw size={13} /> Regenerate Text
            </button>
          )}
        </ActionRow>
      </div>

      {loading && !text && <div className="card"><Loader /></div>}

      {/* Certificate preview */}
      <div style={{ marginBottom: 16 }}>
        <Certificate
          theme={selectedTheme}
          form={form}
          text={text}
          loading={loading}
          certRef={certRef}
        />
      </div>

      {/* Download button */}
      {!loading && (
        <ActionRow>
          <button
            className="btn-brand"
            onClick={downloadPNG}
            disabled={downloading}
            style={{ background: 'var(--gradient-brand)' }}
          >
            <Download size={14} />
            {downloading ? 'Preparing Download…' : 'Download as PNG'}
          </button>
          {THEMES.map(t => (
            <button
              key={t.id}
              className="btn-ghost"
              onClick={() => setSelectedTheme(t)}
              style={{
                fontSize: '0.75rem',
                borderColor: selectedTheme.id === t.id ? t.border : undefined,
                color: selectedTheme.id === t.id ? t.accent : undefined,
              }}
            >
              {t.name}
            </button>
          ))}
        </ActionRow>
      )}

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(255,107,107,0.08)',
          border: '1px solid rgba(255,107,107,0.2)',
          color: 'var(--coral)', fontSize: '0.85rem', marginTop: 12,
        }}>⚠️ {error}</div>
      )}
    </div>
  )
}
