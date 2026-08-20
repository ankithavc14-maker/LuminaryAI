import { Copy, Check, RefreshCw, Download } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export function Loader() {
  return (
    <div className="loader-dots" style={{ padding: '12px 0' }}>
      <span /><span /><span />
      <span style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'DM Sans, sans-serif' }}>
        AI is thinking…
      </span>
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button className="btn-ghost" onClick={copy} style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
      {copied ? <Check size={13} color="var(--mint)" /> : <Copy size={13} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

export function DownloadButton({ text, filename = 'output.txt' }) {
  const dl = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }
  return (
    <button className="btn-ghost" onClick={dl} style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
      <Download size={13} />
      Download
    </button>
  )
}

export function OutputBox({ text, loading, error, className = '', markdown = false }) {
  if (loading && !text) return (
    <div className={`output-box ${className}`}>
      <Loader />
    </div>
  )

  if (error) return (
    <div className="output-box" style={{ borderColor: 'rgba(255,107,107,0.3)', color: 'var(--coral)' }}>
      ⚠️ {error}
    </div>
  )

  if (!text) return null

  return (
    <div className={`output-box output-scroll ${className} ${loading ? 'streaming' : ''}`}>
      {markdown
        ? <div className="md-output"><ReactMarkdown>{text}</ReactMarkdown></div>
        : text
      }
    </div>
  )
}

export function PageHeader({ tag, tagClass = 'tag-coral', title, desc, icon: Icon }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {Icon && <Icon size={16} color="var(--coral)" />}
        <span className={`tag ${tagClass}`}>{tag}</span>
      </div>
      <h1 className="section-title">{title}</h1>
      <p className="section-desc">{desc}</p>
    </div>
  )
}

export function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        fontFamily: 'Syne, sans-serif',
      }}>{label}</label>
      {children}
    </div>
  )
}

export function ActionRow({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
      {children}
    </div>
  )
}

export function ErrorMsg({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10,
      background: 'rgba(255,107,107,0.08)',
      border: '1px solid rgba(255,107,107,0.2)',
      color: 'var(--coral)', fontSize: '0.85rem',
    }}>
      ⚠️ {msg}
    </div>
  )
}
