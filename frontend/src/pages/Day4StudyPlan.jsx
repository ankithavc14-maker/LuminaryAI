import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, DownloadButton, FormField } from '../components/UI'

export default function Day4StudyPlan() {
  const [form, setForm] = useState({ subject: '', level: 'Beginner', duration: '', goal: '' })
  const { text, loading, error, stream, reset } = useStream()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const run = async () => {
    if (!form.subject || !form.duration || !form.goal) return alert('Please fill in all fields.')
    reset()
    await stream('/api/study-plan', form)
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 4 · Project"
        tagClass="tag-violet"
        title="AI Study Planner"
        desc="Get a structured, week-by-week study plan with resources, milestones, and daily schedule."
        icon={BookOpen}
      />

      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <FormField label="Subject">
            <input className="input-base" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Machine Learning, React, DSA…" />
          </FormField>
          <FormField label="Current Level">
            <div style={{ display: 'flex', gap: 8 }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                <button key={l} className="btn-pill" onClick={() => set('level', l)}
                  style={form.level === l ? { background: 'var(--violet-dim)', color: 'var(--violet)', borderColor: 'rgba(167,139,250,0.3)' } : {}}>
                  {l}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Duration Available">
            <input className="input-base" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 4 weeks, 3 months…" />
          </FormField>
          <FormField label="Learning Goal">
            <input className="input-base" value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="e.g. Get a job, Build a project, Pass exam…" />
          </FormField>
        </div>
        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--violet), var(--mint))' }}>
            <BookOpen size={14} />
            {loading ? 'Planning…' : 'Generate Study Plan'}
          </button>
          {text && <CopyButton text={text} />}
          {text && <DownloadButton text={text} filename={`${form.subject}_Study_Plan.txt`} />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="violet-border" markdown />
    </div>
  )
}
