import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Day1Chatbot from './pages/Day1Chatbot'
import Day1Prompts from './pages/Day1Prompts'
import Day2Summarizer from './pages/Day2Summarizer'
import Day2Tone from './pages/Day2Tone'
import Day2Captions from './pages/Day2Captions'
import Day3Certificate from './pages/Day3Certificate'
import Day3Resume from './pages/Day3Resume'
import Day3Theme from './pages/Day3Theme'
import Day4Career from './pages/Day4Career'
import Day4StudyPlan from './pages/Day4StudyPlan'
import Day4Portfolio from './pages/Day4Portfolio'
import Day4Document from './pages/Day4Document'
import Day4Interview from './pages/Day4Interview'
import Hero from './components/Hero'
// ── NEW: JD-aligned features ──
import RAGSystem from './pages/RAGSystem'
import AgentAI from './pages/AgentAI'
import DataPipeline from './pages/DataPipeline'

const PAGES = {
  home: Hero,
  // Day 1
  chatbot: Day1Chatbot,
  prompts: Day1Prompts,
  // Day 2
  summarizer: Day2Summarizer,
  tone: Day2Tone,
  captions: Day2Captions,
  // Day 3
  certificate: Day3Certificate,
  resume: Day3Resume,
  theme: Day3Theme,
  // Day 4
  career: Day4Career,
  study: Day4StudyPlan,
  portfolio: Day4Portfolio,
  document: Day4Document,
  interview: Day4Interview,
  // ── NEW: Agentic AI & RAG ──
  rag: RAGSystem,
  agent: AgentAI,
  pipeline: DataPipeline,
}

export default function App() {
  const [page, setPage] = useState('home')
  const PageComponent = PAGES[page] || Hero

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div className="mesh-bg" />
      <Sidebar current={page} onChange={setPage} />
      <main style={{ flex: 1, padding: '36px 40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <PageComponent onNavigate={setPage} />
      </main>
    </div>
  )
}
