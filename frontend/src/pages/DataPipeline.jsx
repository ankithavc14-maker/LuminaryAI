import { useState } from 'react'
import { Database, Upload, FileText, Layers, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { PageHeader, FormField, ActionRow } from '../components/UI'

export default function DataPipeline() {
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [chunkSize, setChunkSize] = useState(300)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(-1)
  const [collections, setCollections] = useState([])

  const PIPELINE_STEPS = [
    { id: 0, icon: '📥', label: 'Ingestion', desc: 'Read raw source (PDF or text)' },
    { id: 1, icon: '🧹', label: 'Preprocessing', desc: 'Clean, normalize, remove noise' },
    { id: 2, icon: '✂️', label: 'Chunking', desc: `Split into ${chunkSize}-word overlapping chunks` },
    { id: 3, icon: '🔢', label: 'Embedding', desc: 'Generate semantic vector embeddings' },
    { id: 4, icon: '🗄️', label: 'Storage', desc: 'Persist to ChromaDB vector store' },
  ]

  const runPipeline = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setActiveStep(0)

    const tick = (step) => new Promise(res => { setTimeout(() => { setActiveStep(step); res() }, 600) })

    try {
      await tick(1)  // preprocessing
      await tick(2)  // chunking

      let data
      if (file) {
        const form = new FormData()
        form.append('file', file)
        form.append('chunk_size', chunkSize)
        const res = await fetch('/api/pipeline/ingest-pdf', { method: 'POST', body: form })
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail) }
        data = await res.json()
      } else {
        const res = await fetch('/api/pipeline/ingest-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText, source_name: sourceName || 'input', chunk_size: chunkSize }),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail) }
        data = await res.json()
      }

      await tick(3)  // embedding
      await tick(4)  // storage
      await tick(5)  // done

      setResult(data)
      setCollections(prev => [...prev, data])

      // Refresh from server
      const listRes = await fetch('/api/pipeline/collections')
      const listData = await listRes.json()
      setCollections(listData.collections)

    } catch (e) {
      setError(e.message || 'Pipeline failed')
      setActiveStep(-1)
    } finally {
      setLoading(false)
    }
  }

  const loadCollections = async () => {
    try {
      const res = await fetch('/api/pipeline/collections')
      const data = await res.json()
      setCollections(data.collections)
    } catch { }
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Data Pipeline"
        tagClass="tag-gold"
        title="Data Pipeline — Ingest, Process & Index"
        desc="Visualize the full data pipeline: raw document → preprocessing → chunking → embedding → ChromaDB vector store."
        icon={Database}
      />

      {/* Pipeline diagram */}
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px 16px', marginBottom: 28,
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 540 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <>
              <div
                key={step.id}
                style={{
                  flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: 12,
                  background: activeStep === step.id
                    ? 'rgba(255,209,102,0.15)'
                    : activeStep > step.id || result
                      ? 'rgba(0,245,196,0.08)'
                      : 'var(--surface3)',
                  border: `1px solid ${activeStep === step.id
                    ? 'rgba(255,209,102,0.4)'
                    : activeStep > step.id || result
                      ? 'rgba(0,245,196,0.2)'
                      : 'var(--border)'}`,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{(activeStep > step.id || result) ? '✅' : step.icon}</div>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Syne, sans-serif',
                  color: activeStep === step.id ? 'var(--gold)' : activeStep > step.id || result ? 'var(--mint)' : 'var(--text-dim)',
                  marginTop: 4,
                }}>{step.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <ArrowRight
                  key={`arrow-${i}`}
                  size={16}
                  color={activeStep > i || result ? 'var(--mint)' : 'var(--text-muted)'}
                  style={{ flexShrink: 0, margin: '0 4px', transition: 'color 0.3s' }}
                />
              )}
            </>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="PDF File">
            <input
              type="file" accept=".pdf" className="input"
              onChange={e => { setFile(e.target.files[0]); setRawText('') }}
            />
          </FormField>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>— OR —</div>
          <FormField label="Raw Text">
            <textarea
              className="input" rows={4}
              placeholder="Paste text to ingest..."
              value={rawText}
              onChange={e => { setRawText(e.target.value); setFile(null) }}
            />
          </FormField>
          <FormField label="Source Name">
            <input className="input" placeholder="e.g. Research Paper" value={sourceName} onChange={e => setSourceName(e.target.value)} />
          </FormField>
          <FormField label={`Chunk Size: ${chunkSize} words`}>
            <input
              type="range" min={100} max={800} step={50} value={chunkSize}
              onChange={e => setChunkSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>100 (fine)</span><span>800 (coarse)</span>
            </div>
          </FormField>
          <button
            className="btn-brand"
            onClick={runPipeline}
            disabled={loading || (!file && !rawText.trim())}
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--coral))' }}
          >
            {loading ? '⚙️ Running Pipeline...' : <><Database size={14} /> Run Pipeline</>}
          </button>
          <button className="btn-ghost" onClick={loadCollections} style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={13} /> Refresh Collections
          </button>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--coral)', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right: Result + Collections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result && (
            <div style={{ background: 'var(--surface2)', border: '1px solid rgba(0,245,196,0.25)', borderRadius: 14, padding: 18 }}>
              <div style={{ color: 'var(--mint)', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={15} /> Pipeline Success
              </div>
              {[
                ['Collection ID', result.collection_id],
                ['Source', result.filename || result.source_name],
                ['Chunks Created', result.chunks_created],
                ['Total Chars', result.total_chars?.toLocaleString() || '—'],
                ['Status', 'Indexed & Ready'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.83rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: k === 'Collection ID' ? 'var(--mint)' : 'var(--text)', fontFamily: k === 'Collection ID' ? 'DM Mono, monospace' : 'inherit' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Indexed collections */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: '0.75rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>
              Indexed Collections ({collections.length})
            </div>
            {collections.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', textAlign: 'center', padding: '16px 0' }}>
                No collections yet. Run the pipeline first.
              </div>
            ) : (
              collections.map((c, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)' }}>{c.name || c.filename}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem' }}>{c.collection_id}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                    {c.chunk_count || c.chunks_created} chunks
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
