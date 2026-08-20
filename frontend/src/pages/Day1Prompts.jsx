import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, FormField } from '../components/UI'

const PROMPT_TYPES = [
  { key: 'summarize', label: '📌 Summarize (3 bullets)', hint: 'Paste any article or long text' },
  { key: 'instagram', label: '📸 Instagram Captions', hint: 'Enter a topic (e.g. "sustainable fashion")' },
  { key: 'linkedin', label: '💼 LinkedIn Captions', hint: 'Enter a topic (e.g. "startup culture")' },
  { key: 'formalemail', label: '📧 Formal Email', hint: 'Paste a casual message to rewrite' },
  { key: 'certificate_quick', label: '🎓 Certificate Para', hint: 'Enter name, course, and duration' },
]

export default function Day1Prompts() {
  const [selected, setSelected] = useState('summarize')
  const [input, setInput] = useState('')
  const { text, loading, error, stream, reset } = useStream()

  const currentType = PROMPT_TYPES.find(p => p.key === selected)

  const run = async () => {
    if (!input.trim()) return
    reset()
    await stream('/api/prompt-engineering', { text: input, prompt_type: selected })
  }

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 1 · Task 2"
        tagClass="tag-coral"
        title="Prompt Engineering"
        desc="Same input, different prompt — watch how the output changes completely."
        icon={Zap}
      />

      {/* Prompt selector */}
      <div className="card card-glow-coral" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
          Choose Prompt Type
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {PROMPT_TYPES.map(p => (
            <button
              key={p.key}
              className={`btn-pill ${selected === p.key ? 'active' : ''}`}
              onClick={() => setSelected(p.key)}
              style={selected === p.key ? {
                background: 'var(--coral-dim)', color: 'var(--coral)',
                borderColor: 'rgba(255,107,107,0.3)',
              } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{
          padding: '8px 12px', borderRadius: 8,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 16,
        }}>
          💡 {currentType?.hint}
        </div>

        <FormField label="Input">
          <textarea
            className="input-base"
            rows={5}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={currentType?.hint}
          />
        </FormField>

        <ActionRow>
          <button className="btn-brand" onClick={run} disabled={loading || !input.trim()}>
            <Zap size={14} />
            {loading ? 'Generating…' : 'Generate'}
          </button>
          {text && <CopyButton text={text} />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="mint-border" markdown />

      {/* Prompt engineering learning tip */}
      {!text && !loading && (
        <div style={{
          marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          {[
            { tip: 'Be Specific', desc: 'Tell the AI exactly what format you want. "3 bullet points" beats "summarize".' },
            { tip: 'Set Constraints', desc: 'Word limits, tone, audience — all improve output quality dramatically.' },
            { tip: 'Use Examples', desc: 'Show the AI an example of what you expect. Few-shot prompting works great.' },
            { tip: 'Iterate', desc: 'Your first prompt is never the best. Refine it based on the output you get.' },
          ].map(({ tip, desc }) => (
            <div key={tip} style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: 'var(--coral)' }}>{tip}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
