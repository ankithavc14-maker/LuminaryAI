import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, DownloadButton, FormField } from '../components/UI'

export default function Day4Career() {
  const [form, setForm] = useState({ role: '', skills: '', goal: '', time: '' })
  const { text, loading, error, stream, reset } = useStream()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const run = async () => {
    const { role, skills, goal } = form
    if (!role || !skills || !goal) return alert('Please fill in Role, Skills, and Dream Job.')
    reset()
    await stream('/api/career', form)
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 4 · Project"
        tagClass="tag-violet"
        title="AI Career Advisor"
        desc="Get a personalised, actionable career roadmap powered by Gemini. Includes gap analysis, phase planning, and insider tips."
        icon={MapPin}
      />

      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <FormField label="Current Role / Background">
            <input className="input-base" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. CS Graduate, Frontend Dev…" />
          </FormField>
          <FormField label="Skills You Have">
            <input className="input-base" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. React, Python, SQL…" />
          </FormField>
          <FormField label="Dream Job / Goal">
            <input className="input-base" value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="e.g. AI Engineer at a product company…" />
          </FormField>
          <FormField label="Available Time Per Week">
            <input className="input-base" value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 10 hours/week…" />
          </FormField>
        </div>
        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--violet), var(--mint))' }}>
            <MapPin size={14} />
            {loading ? 'Building roadmap…' : 'Generate My Roadmap'}
          </button>
          {text && <CopyButton text={text} label="Copy Roadmap" />}
          {text && <DownloadButton text={text} filename="Career_Roadmap.txt" />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="violet-border" markdown />
    </div>
  )
}
