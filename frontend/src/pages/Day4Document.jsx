import { useState } from 'react'
import { FileCode } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, DownloadButton, FormField } from '../components/UI'

const DOC_TYPES = [
  'Blog Post', 'Technical Report', 'Business Proposal', 'Product Requirements Document',
  'Case Study', 'White Paper', 'Executive Summary', 'Research Summary', 'Newsletter',
]
const TONES = ['Professional', 'Friendly', 'Academic', 'Persuasive', 'Conversational']

export default function Day4Document() {
  const [form, setForm] = useState({ topic: '', doc_type: 'Blog Post', tone: 'Professional' })
  const { text, loading, error, stream, reset } = useStream()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const run = async () => {
    if (!form.topic) return alert('Please enter a topic.')
    reset()
    await stream('/api/document', form)
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 4 · Project"
        tagClass="tag-violet"
        title="AI Document Generator"
        desc="Generate fully structured documents with proper headings, sections, and markdown formatting."
        icon={FileCode}
      />

      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.2)' }}>
        <FormField label="Topic">
          <input className="input-base" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. 'The impact of AI on software engineering jobs'…" />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18, marginTop: 4 }}>
          <FormField label="Document Type">
            <select className="input-base" value={form.doc_type} onChange={e => set('doc_type', e.target.value)} style={{ cursor: 'pointer' }}>
              {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Tone">
            <select className="input-base" value={form.tone} onChange={e => set('tone', e.target.value)} style={{ cursor: 'pointer' }}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
        </div>

        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--violet), var(--mint))' }}>
            <FileCode size={14} />
            {loading ? 'Writing…' : 'Generate Document'}
          </button>
          {text && <CopyButton text={text} />}
          {text && <DownloadButton text={text} filename={`${form.doc_type.replace(/\s+/g,'_')}.md`} />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="violet-border" markdown />
    </div>
  )
}
