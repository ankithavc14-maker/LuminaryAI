import { useState, useRef } from 'react'
import { Database, Upload, Search, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { PageHeader, FormField, ActionRow, OutputBox, CopyButton, DownloadButton } from '../components/UI'
import { useStream } from '../hooks/useStream'
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const apiUrl = (path) => `${API_BASE}${path}`

export default function RAGSystem() {
  // Pipeline / ingest state
  const [tab, setTab] = useState('ingest')
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [chunkSize, setChunkSize] = useState(300)
  const [ingesting, setIngesting] = useState(false)
  const [ingestResult, setIngestResult] = useState(null)
  const [ingestError, setIngestError] = useState('')

  // RAG query state
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [question, setQuestion] = useState('')
  const [provider, setProvider] = useState('gemini')
  const { text, loading, error, stream, reset } = useStream()

  const fileRef = useRef()

  const ingestPDF = async () => {
    if (!file) return
    setIngesting(true)
    setIngestError('')
    setIngestResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('chunk_size', chunkSize)
      const res = await fetch(apiUrl('/api/pipeline/ingest-pdf'), { method: 'POST', body: form })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.detail || 'Ingest failed')
      }
      const data = await res.json()
      setIngestResult(data)
      setCollections(prev => [...prev, { id: data.collection_id, name: data.filename }])
      setSelectedCollection(data.collection_id)
    } catch (e) {
      setIngestError(e.message)
    } finally {
      setIngesting(false)
    }
  }

  const ingestText = async () => {
    if (!rawText.trim()) return
    setIngesting(true)
    setIngestError('')
    setIngestResult(null)
    try {
      const res = await fetch(apiUrl('/api/pipeline/ingest-text'),{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, source_name: sourceName || 'manual_input', chunk_size: chunkSize }),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.detail || 'Ingest failed')
      }
      const data = await res.json()
      setIngestResult(data)
      setCollections(prev => [...prev, { id: data.collection_id, name: data.source_name }])
      setSelectedCollection(data.collection_id)
    } catch (e) {
      setIngestError(e.message)
    } finally {
      setIngesting(false)
    }
  }

  const loadCollections = async () => {
    try {
      const res = await fetch('/api/pipeline/collections')
      const data = await res.json()
      setCollections(data.collections.map(c => ({ id: c.collection_id, name: c.name })))
    } catch { }
  }

  const askQuestion = () => {
    if (!selectedCollection || !question.trim()) return
    stream('/api/rag/query', { collection_id: selectedCollection, question, provider, top_k: 4 })
  }

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem',
    fontWeight: 600, fontFamily: 'Syne, sans-serif',
    background: tab === t ? 'var(--coral)' : 'var(--surface2)',
    color: tab === t ? '#0d0d0d' : 'var(--text-dim)',
    transition: 'all 0.15s',
  })

  return (
    <div className="fade-up">
      <PageHeader
        tag="RAG System"
        tagClass="tag-mint"
        title="RAG — Retrieval Augmented Generation"
        desc="Upload a document or paste text → it gets chunked, embedded, and stored in ChromaDB → ask questions and get answers grounded in your document."
        icon={Database}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={tabStyle('ingest')} onClick={() => setTab('ingest')}>
          📥 Ingest Document
        </button>
        <button style={tabStyle('query')} onClick={() => { setTab('query'); loadCollections() }}>
          🔍 Query RAG
        </button>
      </div>

      {/* ── INGEST TAB ── */}
      {tab === 'ingest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Sub-tabs: PDF vs Text */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['pdf', 'text'].map(t => (
              <button
                key={t}
                onClick={() => setFile(null)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--surface2)', color: 'var(--text-dim)', cursor: 'pointer',
                  fontSize: '0.8rem', fontFamily: 'DM Mono, monospace',
                }}
              >{t === 'pdf' ? '📄 PDF Upload' : '📝 Paste Text'}</button>
            ))}
          </div>

          {/* PDF upload */}
          <FormField label="Upload PDF">
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: 12, padding: '24px',
                textAlign: 'center', cursor: 'pointer', background: 'var(--surface2)',
                transition: 'border-color 0.15s',
              }}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.pdf')) setFile(f) }}
            >
              <Upload size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                {file ? `✅ ${file.name}` : 'Click or drag & drop a PDF'}
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf" hidden onChange={e => setFile(e.target.files[0])} />
          </FormField>

          {/* OR paste text */}
          <FormField label="— OR — Paste Raw Text">
            <textarea
              className="input"
              rows={5}
              placeholder="Paste any text content here to index it..."
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Source Name (optional)">
              <input className="input" placeholder="e.g. Project Report" value={sourceName} onChange={e => setSourceName(e.target.value)} />
            </FormField>
            <FormField label="Chunk Size (words)">
              <input className="input" type="number" min={100} max={800} value={chunkSize} onChange={e => setChunkSize(Number(e.target.value))} />
            </FormField>
          </div>

          <ActionRow>
            <button className="btn-brand" onClick={file ? ingestPDF : ingestText} disabled={ingesting || (!file && !rawText.trim())}>
              {ingesting ? <><Loader2 size={14} className="spin" /> Processing Pipeline...</> : <><Database size={14} /> Run Data Pipeline</>}
            </button>
          </ActionRow>

          {/* Pipeline result */}
          {ingestResult && (
            <div style={{ background: 'var(--surface2)', border: '1px solid rgba(0,245,196,0.2)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--mint)', fontWeight: 700 }}>
                <CheckCircle size={16} /> Pipeline Complete
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <div>📄 Source: <span style={{ color: 'var(--text)' }}>{ingestResult.filename || ingestResult.source_name}</span></div>
                <div>🧩 Chunks: <span style={{ color: 'var(--text)' }}>{ingestResult.chunks_created}</span></div>
                <div>🔑 Collection ID: <span style={{ color: 'var(--mint)', fontFamily: 'DM Mono, monospace' }}>{ingestResult.collection_id}</span></div>
              </div>
              {ingestResult.pipeline_steps && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Pipeline Steps</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ingestResult.pipeline_steps.map((s, i) => (
                      <span key={i} style={{ background: 'var(--mint-dim)', color: 'var(--mint)', borderRadius: 6, padding: '3px 8px', fontSize: '0.78rem' }}>
                        {i + 1}. {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button className="btn-brand" style={{ marginTop: 14, fontSize: '0.82rem' }} onClick={() => setTab('query')}>
                <Search size={13} /> Query This Document →
              </button>
            </div>
          )}

          {ingestError && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--coral)', fontSize: '0.85rem' }}>
              ⚠️ {ingestError}
            </div>
          )}
        </div>
      )}

      {/* ── QUERY TAB ── */}
      {tab === 'query' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Select Document">
              <select className="input" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}>
                <option value="">— Choose indexed document —</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                ))}
              </select>
            </FormField>
            <FormField label="AI Provider">
              <select className="input" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="gemini">Gemini 3.6 Flash</option>
                <option value="openai">OpenAI GPT-4o Mini</option>
              </select>
            </FormField>
          </div>

          <FormField label="Your Question">
            <textarea
              className="input"
              rows={3}
              placeholder="Ask anything about your document..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.ctrlKey && askQuestion()}
            />
          </FormField>

          <ActionRow>
            <button className="btn-brand" onClick={askQuestion} disabled={loading || !selectedCollection || !question.trim()}>
              <Search size={14} /> Ask Document
            </button>
            {text && <CopyButton text={text} />}
            {text && <button className="btn-ghost" onClick={reset} style={{ fontSize: '0.8rem', padding: '7px 14px' }}>Clear</button>}
          </ActionRow>

          <OutputBox text={text} loading={loading} error={error} markdown />
        </div>
      )}
    </div>
  )
}
