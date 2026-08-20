import { useState } from 'react'
import { Brain } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, DownloadButton, FormField } from '../components/UI'

const COMPANY_TYPES = [
  'Tech Startup', 'FAANG / Big Tech', 'Mid-size Product Company',
  'Consulting Firm', 'Government / PSU', 'Agency / Service Company',
]

const EXPERIENCE_LEVELS = ['Fresher / Entry Level', '1–2 Years', '2–5 Years', '5+ Years']

export default function Day4Interview() {
  const [form, setForm] = useState({ role: '', experience: 'Fresher / Entry Level', company_type: 'Tech Startup' })
  const { text, loading, error, stream, reset } = useStream()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const run = async () => {
    if (!form.role) return alert('Please enter the role you are interviewing for.')
    reset()
    await stream('/api/interview', form)
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 4 · Project"
        tagClass="tag-violet"
        title="AI Interview Prep"
        desc="Your personal interview coach. Top questions, STAR answers, technical topics, and salary tips."
        icon={Brain}
      />

      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <FormField label="Target Role">
            <input className="input-base" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Frontend Engineer, Data Scientist…" />
          </FormField>
          <FormField label="Company Type">
            <select className="input-base" value={form.company_type} onChange={e => set('company_type', e.target.value)} style={{ cursor: 'pointer' }}>
              {COMPANY_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Experience Level">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EXPERIENCE_LEVELS.map(l => (
                  <button key={l} className="btn-pill" onClick={() => set('experience', l)}
                    style={form.experience === l ? {
                      background: 'var(--violet-dim)', color: 'var(--violet)',
                      borderColor: 'rgba(167,139,250,0.3)',
                    } : {}}>
                    {l}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading} style={{ background: 'linear-gradient(135deg, var(--violet), var(--mint))' }}>
            <Brain size={14} />
            {loading ? 'Preparing guide…' : 'Generate Interview Prep'}
          </button>
          {text && <CopyButton text={text} />}
          {text && <DownloadButton text={text} filename={`Interview_Prep_${form.role.replace(/\s+/g,'_')}.txt`} />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="violet-border" markdown />
    </div>
  )
}
