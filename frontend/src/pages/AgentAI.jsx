import { useState, useRef, useEffect } from 'react'
import { Bot, Play, Eye, Zap, ChevronRight, Loader2 } from 'lucide-react'
import { PageHeader, FormField, ActionRow, CopyButton, DownloadButton } from '../components/UI'
import ReactMarkdown from 'react-markdown'
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const apiUrl = (path) => `${API_BASE}${path}`
export default function AgentAI() {
  const [goal, setGoal] = useState('')
  const [context, setContext] = useState('')
  const [provider, setProvider] = useState('gemini')
  const [maxSteps, setMaxSteps] = useState(4)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [planPreview, setPlanPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const abortRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output, loading])

  const previewPlan = async () => {
    if (!goal.trim()) return
    setPreviewLoading(true)
    setPlanPreview(null)
    try {
      const res = await fetch(apiUrl('/api/agent/plan-only'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, context, provider, max_steps: maxSteps }),
      })
      const data = await res.json()
      setPlanPreview(data)
    } catch {
      setPlanPreview({ error: 'Failed to generate plan' })
    } finally {
      setPreviewLoading(false)
    }
  }

  const runAgent = async () => {
    if (!goal.trim() || loading) return
    setOutput('')
    setLoading(true)
    setPlanPreview(null)

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    try {
      const res = await fetch(apiUrl('/api/agent/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, context, provider, max_steps: maxSteps }),
        signal: abortRef.current.signal,
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setOutput(full)
      }
    } catch (e) {
      if (e.name !== 'AbortError') setOutput(prev => prev + `\n\n⚠️ Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const stop = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  const EXAMPLE_GOALS = [
    "Research and create a complete learning roadmap for becoming an ML Engineer in 6 months",
    "Analyze the pros and cons of microservices vs monolithic architecture and recommend one",
    "Design a full-stack web app architecture for a real-time chat application",
    "Create a data science project plan for predicting customer churn",
  ]

  return (
    <div className="fade-up">
      <PageHeader
        tag="Agentic AI"
        tagClass="tag-coral"
        title="Agentic AI — Multi-Step Task Execution"
        desc="Give the agent a goal. It plans, breaks it into steps, executes each one autonomously, then synthesizes a final answer."
        icon={Bot}
      />

      {/* How it works */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 28, borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        {[
          { icon: '🎯', label: 'Goal Input' },
          { icon: '→', label: '', arrow: true },
          { icon: '📋', label: 'Planning' },
          { icon: '→', label: '', arrow: true },
          { icon: '⚡', label: 'Execution' },
          { icon: '→', label: '', arrow: true },
          { icon: '🔗', label: 'Synthesis' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: s.arrow ? 0 : 1, padding: s.arrow ? '10px 4px' : '10px 8px',
            background: 'var(--surface2)', textAlign: 'center',
            borderRight: i < 6 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: s.arrow ? '1rem' : '1.2rem', color: s.arrow ? 'var(--text-muted)' : 'var(--text)' }}>{s.icon}</div>
            {!s.arrow && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{s.label}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Example goals */}
        <FormField label="Try an Example Goal">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXAMPLE_GOALS.map((eg, i) => (
              <button
                key={i}
                onClick={() => setGoal(eg)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                  fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'left',
                }}
              >
                {eg.slice(0, 55)}…
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Goal — What should the agent accomplish?">
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. Research and create a learning roadmap for getting into AI/ML engineering..."
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
        </FormField>

        <FormField label="Context (optional)">
          <textarea
            className="input"
            rows={2}
            placeholder="Any background info to help the agent (your current skills, constraints, etc.)"
            value={context}
            onChange={e => setContext(e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="AI Provider">
            <select className="input" value={provider} onChange={e => setProvider(e.target.value)}>
              <option value="gemini">Gemini 3.6 Flash</option>
              <option value="openai">OpenAI GPT-4o Mini</option>
            </select>
          </FormField>
          <FormField label="Max Steps">
            <select className="input" value={maxSteps} onChange={e => setMaxSteps(Number(e.target.value))}>
              <option value={3}>3 steps (fast)</option>
              <option value={4}>4 steps (balanced)</option>
              <option value={5}>5 steps (thorough)</option>
            </select>
          </FormField>
        </div>

        <ActionRow>
          <button className="btn-brand" onClick={runAgent} disabled={loading || !goal.trim()}>
            {loading ? <><Loader2 size={14} className="spin" /> Agent Running...</> : <><Play size={14} /> Run Agent</>}
          </button>
          <button className="btn-ghost" onClick={previewPlan} disabled={previewLoading || !goal.trim()} style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
            {previewLoading ? <Loader2 size={13} className="spin" /> : <Eye size={13} />}
            Preview Plan
          </button>
          {loading && (
            <button className="btn-ghost" onClick={stop} style={{ fontSize: '0.8rem', padding: '7px 14px', color: 'var(--coral)' }}>
              ⏹ Stop
            </button>
          )}
          {output && <CopyButton text={output} />}
          {output && <DownloadButton text={output} filename="agent-output.md" />}
        </ActionRow>

        {/* Plan preview */}
        {planPreview && !planPreview.error && (
          <div style={{ background: 'var(--surface2)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 14, padding: 18 }}>
            <div style={{ color: 'var(--violet)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> Plan Preview
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 12 }}>{planPreview.plan_summary}</div>
            {planPreview.steps?.map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ background: 'var(--violet-dim)', color: 'var(--violet)', borderRadius: 4, padding: '1px 7px', fontSize: '0.72rem', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>
                  {s.step}
                </span>
                <div>
                  <span style={{ background: 'var(--surface3)', color: 'var(--text-muted)', borderRadius: 4, padding: '1px 6px', fontSize: '0.68rem', marginRight: 6 }}>{s.tool}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{s.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Output */}
        {(output || loading) && (
          <div className={`output-box output-scroll ${loading ? 'streaming' : ''}`} style={{ minHeight: 200 }}>
            <div className="md-output">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Loader2 size={12} className="spin" /> Agent working...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}
