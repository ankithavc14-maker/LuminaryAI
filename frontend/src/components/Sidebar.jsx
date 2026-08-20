import { useState } from 'react'
import {
  Home, MessageSquare, Zap, FileText, Mic, Image,
  Award, Briefcase, Palette, MapPin, BookOpen,
  User, FileCode, Brain, ChevronDown, ChevronRight,
  Sparkles, Database, Bot, Layers
} from 'lucide-react'

const NAV = [
  { key: 'home', label: 'Home', icon: Home },
  {
    label: 'Chat & Prompts',
    tag: 'coral',
    items: [
      { key: 'chatbot', label: 'AI Chatbot', icon: MessageSquare },
      { key: 'prompts', label: 'Prompt Studio', icon: Zap },
    ],
  },
  {
    label: 'Text Tools',
    tag: 'mint',
    items: [
      { key: 'summarizer', label: 'Text Summarizer', icon: FileText },
      { key: 'tone', label: 'Tone Converter', icon: Mic },
      { key: 'captions', label: 'Caption Generator', icon: Image },
    ],
  },
  {
    label: 'Create',
    tag: 'gold',
    items: [
      { key: 'certificate', label: 'Certificate Maker', icon: Award },
      { key: 'resume', label: 'Resume Booster', icon: Briefcase },
      { key: 'theme', label: 'Theme Suggestions', icon: Palette },
    ],
  },
  {
    label: 'Career & Growth',
    tag: 'violet',
    items: [
      { key: 'career', label: 'Career Advisor', icon: MapPin },
      { key: 'study', label: 'Study Planner', icon: BookOpen },
      { key: 'portfolio', label: 'Portfolio Gen', icon: User },
      { key: 'document', label: 'Document Gen', icon: FileCode },
      { key: 'interview', label: 'Interview Prep', icon: Brain },
    ],
  },
  // ── NEW SECTION ───────────────────────────────────────
  {
    label: 'AI Engineering',
    tag: 'teal',
    items: [
      { key: 'agent', label: 'Agentic AI', icon: Bot },
      { key: 'rag', label: 'RAG System', icon: Database },
      { key: 'pipeline', label: 'Data Pipeline', icon: Layers },
    ],
  },
]

const tagColors = {
  coral: { bg: 'var(--coral-dim)', color: 'var(--coral)', border: 'rgba(255,107,107,0.2)' },
  mint: { bg: 'var(--mint-dim)', color: 'var(--mint)', border: 'rgba(0,245,196,0.2)' },
  gold: { bg: 'var(--gold-dim)', color: 'var(--gold)', border: 'rgba(255,209,102,0.2)' },
  violet: { bg: 'var(--violet-dim)', color: 'var(--violet)', border: 'rgba(167,139,250,0.2)' },
  teal: { bg: 'rgba(20,184,166,0.10)', color: '#2dd4bf', border: 'rgba(20,184,166,0.2)' },
}

export default function Sidebar({ current, onChange }) {
  const [collapsed, setCollapsed] = useState({})
  const toggle = (label) => setCollapsed(c => ({ ...c, [label]: !c[label] }))

  return (
    <aside style={{
      width: 240, minWidth: 240,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '24px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={16} color="#0d0d0d" />
        </div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>
            Luminary
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
            AI Studio v3
          </div>
        </div>
      </div>

      {NAV.map((item) => {
        if (!item.items) {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={`sidebar-link ${current === item.key ? 'active' : ''}`}
              onClick={() => onChange(item.key)}
            >
              <Icon size={15} />
              {item.label}
            </button>
          )
        }

        const tc = tagColors[item.tag] || tagColors.coral
        const isOpen = !collapsed[item.label]

        return (
          <div key={item.label} style={{ marginTop: 8 }}>
            <button
              onClick={() => toggle(item.label)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '6px 8px',
                background: item.tag === 'teal' ? 'rgba(20,184,166,0.06)' : 'none',
                border: item.tag === 'teal' ? '1px solid rgba(20,184,166,0.15)' : 'none',
                borderRadius: 8, cursor: 'pointer',
              }}
            >
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.8px',
                textTransform: 'uppercase', fontFamily: 'Syne, sans-serif',
                color: tc.color,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {item.tag === 'teal' && '✦ '}
                {item.label}
              </span>
              {isOpen
                ? <ChevronDown size={12} color={tc.color} />
                : <ChevronRight size={12} color={tc.color} />}
            </button>
            {isOpen && item.items.map(sub => {
              const Icon = sub.icon
              return (
                <button
                  key={sub.key}
                  className={`sidebar-link ${current === sub.key ? 'active' : ''}`}
                  onClick={() => onChange(sub.key)}
                  style={{ marginLeft: 8 }}
                >
                  <Icon size={14} />
                  {sub.label}
                </button>
              )
            })}
          </div>
        )
      })}

      {/* Footer */}
      <div style={{
        marginTop: 'auto', padding: '16px 8px 4px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.72rem', color: 'var(--text-muted)',
        fontFamily: 'DM Mono, monospace', lineHeight: 1.5,
      }}>
        Luminary AI Studio v3<br />
        Gemini · OpenAI · ChromaDB · FastAPI
      </div>
    </aside>
  )
}
