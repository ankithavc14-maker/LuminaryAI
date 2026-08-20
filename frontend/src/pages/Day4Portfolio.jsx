import { useState } from 'react'
import { User } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, DownloadButton, FormField } from '../components/UI'

export default function Day4Portfolio() {
  const [form, setForm] = useState({ name: '', role: '', skills: '', projects: '', bio: '' })
  const { text, loading, error, stream, reset } = useStream()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const run = async () => {
    if (!form.name || !form.role || !form.skills) return alert('Please fill in Name, Role, and Skills.')
    reset()
    await stream('/api/portfolio', form)
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 4 · Project"
        tagClass="tag-violet"
        title="AI Portfolio Generator"
        desc="Transform your raw details into compelling portfolio copy — taglines, bios, project descriptions, and more."
        icon={User}
      />

      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Full Name">
            <input className="input-base" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Priya Patel" />
          </FormField>
          <FormField label="Target Role">
            <input className="input-base" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Full-Stack Developer, ML Engineer…" />
          </FormField>
          <FormField label="Skills">
            <input className="input-base" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. React, Node.js, Python, AWS…" />
          </FormField>
          <FormField label="Key Projects">
            <input className="input-base" value={form.projects} onChange={e => set('projects', e.target.value)} placeholder="e.g. E-commerce app, AI chatbot, Portfolio site…" />
          </FormField>
        </div>
        <FormField label="Short Bio">
          <textarea className="input-base" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Write a rough bio about yourself (doesn't have to be perfect)…" />
        </FormField>
        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--violet), var(--mint))' }}>
            <User size={14} />
            {loading ? 'Generating…' : 'Generate Portfolio Content'}
          </button>
          {text && <CopyButton text={text} />}
          {text && <DownloadButton text={text} filename={`${form.name.replace(/\s+/g,'_')}_Portfolio.txt`} />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="violet-border" markdown />
    </div>
  )
}
