import { Sparkles, ArrowRight, Brain, Award, Rocket, MessageSquare, Bot, Database, Layers } from 'lucide-react'

const FEATURES = [
  {
    icon: MessageSquare, tag: 'Chat & Prompts', tagClass: 'tag-coral', color: 'var(--coral)',
    title: 'AI Chatbot & Prompt Studio',
    desc: 'Real-time streaming chatbot with conversation memory + prompt engineering across 5 output styles.',
  },
  {
    icon: Brain, tag: 'Text Tools', tagClass: 'tag-mint', color: 'var(--mint)',
    title: 'Text Feature Suite',
    desc: 'Summarizer, Tone Converter (4 modes), and Caption Generator for Instagram, LinkedIn & more.',
  },
  {
    icon: Award, tag: 'Create', tagClass: 'tag-gold', color: 'var(--gold)',
    title: 'Professional Creator',
    desc: 'Real downloadable Certificates with themes & stamps, Resume Booster, and live Theme Suggestions.',
  },
  {
    icon: Rocket, tag: 'Career & Growth', tagClass: 'tag-violet', color: 'var(--violet)',
    title: 'Career Tools',
    desc: 'Career Advisor, Study Planner, Portfolio Generator, Document Creator, and Interview Prep Coach.',
  },
  {
    icon: Bot, tag: 'Agentic AI', tagClass: 'tag-teal', color: '#2dd4bf',
    title: 'Autonomous AI Agent',
    desc: 'Give it a goal — it plans, executes multi-step tasks, and synthesizes a final answer autonomously.',
  },
  {
    icon: Database, tag: 'RAG System', tagClass: 'tag-teal', color: '#2dd4bf',
    title: 'Retrieval Augmented Generation',
    desc: 'Upload PDFs, index them in ChromaDB, then ask questions grounded in your document content.',
  },
]

export default function Hero({ onNavigate }) {
  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{ marginBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span className="tag tag-mint">
            <Sparkles size={10} />
            Luminary AI Studio v3
          </span>
          <span className="tag tag-coral">Gemini 2.5 Flash</span>
          <span className="tag" style={{ background: 'rgba(20,184,166,0.1)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.2)' }}>
            + OpenAI · ChromaDB · Agentic AI
          </span>
        </div>

        <h1 className="font-display" style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: 20,
          letterSpacing: '-0.02em',
        }}>
          Your AI-Powered<br />
          <span style={{
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Creative Studio</span>
        </h1>

        <p style={{
          fontSize: '1.1rem', color: 'var(--text-dim)',
          maxWidth: 560, lineHeight: 1.7, marginBottom: 32,
        }}>
          16 AI tools in one workspace — now with <strong style={{ color: '#2dd4bf' }}>Agentic AI</strong>, <strong style={{ color: '#2dd4bf' }}>RAG System</strong>, and a full <strong style={{ color: '#2dd4bf' }}>Data Pipeline</strong>. Powered by Gemini + OpenAI with ChromaDB vector storage.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-brand" onClick={() => onNavigate('agent')}>
            Try Agentic AI <ArrowRight size={15} />
          </button>
          <button className="btn-ghost" onClick={() => onNavigate('rag')}>
            Try RAG System
          </button>
          <button className="btn-ghost" onClick={() => onNavigate('chatbot')}>
            Open Chatbot
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48,
      }}>
        {[
          { n: '16', label: 'AI Tools' },
          { n: '5', label: 'Categories' },
          { n: '2', label: 'AI Providers' },
          { n: 'RAG', label: '+ Agentic' },
        ].map(({ n, label }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>{n}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {FEATURES.map(({ icon: Icon, tag, tagClass, color, title, desc }, i) => (
          <div key={title} className={`card fade-up fade-up-${i + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`tag ${tagClass}`} style={
                tagClass === 'tag-teal'
                  ? { background: 'rgba(20,184,166,0.1)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.2)' }
                  : {}
              }>{tag}</span>
              <Icon size={18} color={color} />
            </div>
            <div className="font-display" style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div style={{ marginTop: 36, padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
        <div style={{ fontSize: '0.72rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 12 }}>Tech Stack</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['React 18', 'Vite 5', 'Tailwind CSS', 'FastAPI', 'Python', 'Gemini 2.5 Flash', 'OpenAI GPT-4o Mini', 'ChromaDB', 'sentence-transformers', 'PyPDF2', 'Agentic AI', 'RAG Pipeline', 'Streaming SSE'].map(t => (
            <span key={t} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 10px',
              fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'DM Mono, monospace',
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
