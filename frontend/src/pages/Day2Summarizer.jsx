import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import { PageHeader, OutputBox, ActionRow, CopyButton, DownloadButton, FormField } from '../components/UI'

export default function Day2Summarizer() {
  const [input, setInput] = useState('')
  const { text, loading, error, stream, reset } = useStream()

  const run = async () => {
    if (!input.trim()) return
    reset()
    await stream('/api/summarize', { text: input })
  }

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.ceil(wordCount / 200)

  return (
    <div className="fade-up">
      <PageHeader
        tag="Day 2 · Task 1"
        tagClass="tag-mint"
        title="AI Text Summarizer"
        desc="Paste any article or document. Get a clear 3–5 sentence summary instantly."
        icon={FileText}
      />

      <div className="card card-glow-mint" style={{ marginBottom: 16 }}>
        <FormField label="Article or Document">
          <textarea
            className="input-base"
            rows={9}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste a long article, research paper, blog post, or any document here…"
          />
        </FormField>

        {/* Word count */}
        {wordCount > 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>📊 {wordCount} words</span>
            <span>⏱️ ~{readTime} min read</span>
            <span>→ Summary in ~5 sentences</span>
          </div>
        )}

        <ActionRow>
          <button className="btn-cool" onClick={run} disabled={loading || !input.trim()}>
            <FileText size={14} />
            {loading ? 'Summarizing…' : 'Summarize'}
          </button>
          {text && <CopyButton text={text} />}
          {text && <DownloadButton text={text} filename="summary.txt" />}
        </ActionRow>
      </div>

      <OutputBox text={text} loading={loading} error={error} className="mint-border" />

      {text && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 10,
          background: 'var(--mint-dim)', border: '1px solid rgba(0,245,196,0.15)',
          fontSize: '0.8rem', color: 'var(--text-dim)',
        }}>
          ✅ Reduced from ~{wordCount} words to ~{text.trim().split(/\s+/).length} words
          ({Math.round((1 - text.trim().split(/\s+/).length / wordCount) * 100)}% compression)
        </div>
      )}
    </div>
  )
}
