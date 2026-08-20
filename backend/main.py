import os
import json
import asyncio
import uuid
import re
from google import genai
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional, List

# ── NEW: RAG / Vector store dependencies ──────────────────────
import chromadb
from chromadb.utils import embedding_functions
import PyPDF2
import io

# ── NEW: OpenAI ───────────────────────────────────────────────
from openai import OpenAI

load_dotenv()

app = FastAPI(title="Luminary AI Studio API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API clients ───────────────────────────────────────────────
gemini_api_key = os.getenv("GEMINI_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

gemini_client = None
if gemini_api_key:
    gemini_client = genai.Client(api_key=gemini_api_key)
else:
    print("WARNING: GEMINI_API_KEY not set.")

openai_client = None
if openai_api_key:
    openai_client = OpenAI(api_key=openai_api_key)
else:
    print("WARNING: OPENAI_API_KEY not set.")

# ── ChromaDB setup ────────────────────────────────────────────
chroma_client = chromadb.Client()
embedding_fn = embedding_functions.DefaultEmbeddingFunction()

# In-memory registry: collection_id -> {name, doc_count, chunks}
rag_collections: dict = {}

# ── Request Models ────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []
    provider: Optional[str] = "gemini"   # "gemini" | "openai"

class PromptRequest(BaseModel):
    text: str
    prompt_type: str
    provider: Optional[str] = "gemini"

class SummarizeRequest(BaseModel):
    text: str
    provider: Optional[str] = "gemini"

class ToneRequest(BaseModel):
    text: str
    tone: str
    provider: Optional[str] = "gemini"

class CaptionRequest(BaseModel):
    topic: str
    provider: Optional[str] = "gemini"

class CertificateRequest(BaseModel):
    name: str
    course: str
    duration: str

class ResumeRequest(BaseModel):
    resume_text: str
    provider: Optional[str] = "gemini"

class ThemeRequest(BaseModel):
    description: str
    provider: Optional[str] = "gemini"

class CareerRequest(BaseModel):
    role: str
    skills: str
    goal: str
    time: Optional[str] = "flexible"
    provider: Optional[str] = "gemini"

class StudyPlanRequest(BaseModel):
    subject: str
    level: str
    duration: str
    goal: str
    provider: Optional[str] = "gemini"

class PortfolioRequest(BaseModel):
    name: str
    role: str
    skills: str
    projects: str
    bio: str
    provider: Optional[str] = "gemini"

class DocumentRequest(BaseModel):
    topic: str
    doc_type: str
    tone: str
    provider: Optional[str] = "gemini"

class InterviewRequest(BaseModel):
    role: str
    experience: str
    company_type: Optional[str] = "tech startup"
    provider: Optional[str] = "gemini"

# ── NEW: RAG Models ───────────────────────────────────────────
class RAGQueryRequest(BaseModel):
    collection_id: str
    question: str
    provider: Optional[str] = "gemini"
    top_k: Optional[int] = 4

# ── NEW: Agentic AI Models ────────────────────────────────────
class AgentRequest(BaseModel):
    goal: str
    context: Optional[str] = ""
    provider: Optional[str] = "gemini"
    max_steps: Optional[int] = 5

# ── NEW: Data Pipeline Models ─────────────────────────────────
class PipelineTextRequest(BaseModel):
    text: str
    source_name: Optional[str] = "manual_input"
    chunk_size: Optional[int] = 300

# ─── Streaming Helpers ────────────────────────────────────────

async def stream_gemini(prompt: str):
    if not gemini_client:
        yield "Error: GEMINI_API_KEY is not configured."
        return
    try:
        response = gemini_client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text
                await asyncio.sleep(0.005)
    except Exception as e:
        yield f"\n\n⚠️ Error: {str(e)}"

async def stream_openai(prompt: str):
    if not openai_client:
        yield "Error: OPENAI_API_KEY is not configured."
        return
    try:
        stream = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
                await asyncio.sleep(0.005)
    except Exception as e:
        yield f"\n\n⚠️ Error: {str(e)}"

async def stream_prompt(prompt: str, provider: str = "gemini"):
    if provider == "openai":
        async for chunk in stream_openai(prompt):
            yield chunk
    else:
        async for chunk in stream_gemini(prompt):
            yield chunk

async def get_gemini(prompt: str) -> str:
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_openai(prompt: str) -> str:
    if not openai_client:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured.")
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_completion(prompt: str, provider: str = "gemini") -> str:
    if provider == "openai":
        return await get_openai(prompt)
    return await get_gemini(prompt)

# ─── Health ───────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gemini_key_set": bool(gemini_api_key),
        "openai_key_set": bool(openai_api_key),
        "rag_collections": len(rag_collections),
    }

@app.get("/")
def root():
    return {"message": "Luminary AI Studio API v3.0 — running"}

# ─── Day 1: Chat ──────────────────────────────────────────────

@app.post("/api/chat")
async def chat(req: ChatRequest):
    history_text = ""
    for msg in req.history[-6:]:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"{role}: {msg['content']}\n"
    prompt = f"{history_text}User: {req.message}\nAssistant:"
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── Day 1: Prompt Engineering ───────────────────────────────

@app.post("/api/prompt-engineering")
async def prompt_engineering(req: PromptRequest):
    prompts = {
        "summarize": f"Summarize the following text into exactly 3 clear bullet points. Each bullet starts with •. Keep each point under 20 words.\n\nText:\n{req.text}",
        "instagram": f"Generate 5 creative Instagram captions for this topic. Each with emojis and 3–5 hashtags. Number them 1–5.\n\nTopic:\n{req.text}",
        "linkedin": f"Generate 5 professional LinkedIn captions for this topic. Insightful, under 150 words each, first person. Number them 1–5.\n\nTopic:\n{req.text}",
        "formalemail": f"Rewrite the following casual message as a formal professional email. Include subject line, greeting, body, and sign-off.\n\nCasual message:\n{req.text}",
        "certificate_quick": f"Write a short professional certificate completion paragraph (3–4 sentences) for: {req.text}. Make it warm, formal, and motivating.",
    }
    prompt = prompts.get(req.prompt_type, req.text)
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── Day 2: Summarizer ───────────────────────────────────────

@app.post("/api/summarize")
async def summarize(req: SummarizeRequest):
    prompt = f"You are a professional summarizer. Summarize the following text in 3–5 clear complete sentences. Focus on main points only. No intro or outro.\n\nText:\n{req.text}"
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── Day 2: Tone Converter ───────────────────────────────────

@app.post("/api/tone")
async def tone_convert(req: ToneRequest):
    guides = {
        "Professional": "clear, confident, and business-appropriate. Avoid slang.",
        "Friendly": "warm, conversational, and approachable. Use contractions naturally.",
        "Formal": "highly formal and structured, as if writing to a senior executive.",
        "Casual": "relaxed everyday language like texting a friend. Use simple words.",
    }
    guide = guides.get(req.tone, "neutral and balanced")
    prompt = f"Rewrite the following text in a {req.tone} tone. It should be {guide} Keep the meaning identical. Return only the rewritten text.\n\nOriginal:\n{req.text}"
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── Day 2: Caption Generator ────────────────────────────────

@app.post("/api/captions")
async def captions(req: CaptionRequest):
    prompt = f"""Generate exactly 3 social media captions for the following topic. Return ONLY a JSON array, no markdown:
[
  {{"platform": "Instagram", "caption": "..."}},
  {{"platform": "LinkedIn", "caption": "..."}},
  {{"platform": "General", "caption": "..."}}
]
Instagram: engaging, emojis, 2–4 hashtags.
LinkedIn: professional, insight-driven, no hashtags.
General: versatile, punchy, 1–2 hashtags.
Topic: {req.topic}"""
    raw = await get_completion(prompt, req.provider)
    raw = raw.replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid JSON from AI")
    return data

# ─── Day 3: Certificate ──────────────────────────────────────

@app.post("/api/certificate")
async def certificate(req: CertificateRequest):
    prompt = f"Write a professional, formal, and motivating certificate of completion paragraph for:\n- Name: {req.name}\n- Course / Role: {req.course}\n- Duration: {req.duration}\n\nThe paragraph should be 3–4 sentences, written in third person, suitable for an official certificate. No heading — just the body text."
    return StreamingResponse(stream_gemini(prompt), media_type="text/plain")

# ─── Day 3: Resume Booster ───────────────────────────────────

@app.post("/api/resume")
async def resume_boost(req: ResumeRequest):
    prompt = f"You are a professional resume writer. Rewrite the following resume bullet points or skills list to be more impactful, action-oriented, and professional. Use strong action verbs, quantify where possible, keep each point concise. Return only improved bullet points, one per line, starting with •.\n\nOriginal:\n{req.resume_text}"
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── Day 3: Theme Suggestions ────────────────────────────────

@app.post("/api/theme")
async def theme(req: ThemeRequest):
    prompt = f"""You are a professional UI/UX designer. Based on the following project description, suggest a complete UI theme. Return ONLY JSON, no markdown:
{{
  "palette": [
    {{"name": "Primary", "hex": "#xxxxxx"}},
    {{"name": "Secondary", "hex": "#xxxxxx"}},
    {{"name": "Accent", "hex": "#xxxxxx"}},
    {{"name": "Background", "hex": "#xxxxxx"}}
  ],
  "fonts": {{"heading": "Font Name", "body": "Font Name"}},
  "style": "One sentence describing the visual style.",
  "reasoning": "One sentence explaining why this theme fits the project."
}}
Project: {req.description}"""
    raw = await get_completion(prompt, req.provider)
    raw = raw.replace("```json", "").replace("```", "").strip()
    try:
        data = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Invalid JSON from AI")
    return data

# ─── Day 4: Career Advisor ───────────────────────────────────

@app.post("/api/career")
async def career(req: CareerRequest):
    prompt = f"""You are an expert career coach and AI advisor. Create a detailed personalised career roadmap.

Profile:
- Current Role / Background: {req.role}
- Current Skills: {req.skills}
- Dream Job / Goal: {req.goal}
- Available Time: {req.time or 'not specified'}

Structure with these sections:
1. 📊 Gap Analysis — what skills are missing
2. 🗺️ Roadmap (3 Phases) — Phase 1 (0–3 months), Phase 2 (3–6 months), Phase 3 (6–12 months)
3. 🛠️ Top 5 Technologies / Tools to Learn (with one line on why each)
4. 📚 Recommended Resources (2–3 specific courses or platforms)
5. 💡 Insider Tips — 3 practical career tips for this specific goal
6. 🚀 First Step to Take Tomorrow

Be specific, actionable, and encouraging."""
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── EXTRA: Study Planner ─────────────────────────────────────

@app.post("/api/study-plan")
async def study_plan(req: StudyPlanRequest):
    prompt = f"""Create a structured, week-by-week study plan for:
- Subject: {req.subject}
- Current Level: {req.level}
- Duration Available: {req.duration}
- Goal: {req.goal}

Include:
📅 Week-by-week breakdown with specific topics
📖 Resources for each week (books, courses, videos)
✅ Milestones and checkpoints
🧠 Study techniques best suited for this subject
⚡ Daily study schedule recommendation

Make it practical, motivating, and specific."""
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── EXTRA: Portfolio Generator ──────────────────────────────

@app.post("/api/portfolio")
async def portfolio(req: PortfolioRequest):
    prompt = f"""Write professional portfolio content for a developer/professional:
- Name: {req.name}
- Role: {req.role}
- Skills: {req.skills}
- Projects: {req.projects}
- Bio: {req.bio}

Generate:
1. 🎯 Hero Tagline (one punchy sentence)
2. 👤 About Me section (3–4 compelling sentences)
3. 💼 Project descriptions rewritten to impress (for each project listed)
4. 🛠️ Skills narrative (not just a list — tell the story)
5. 📬 Contact CTA paragraph

Make it sound human, confident, and memorable."""
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── EXTRA: Document Generator ───────────────────────────────

@app.post("/api/document")
async def document(req: DocumentRequest):
    prompt = f"Write a {req.doc_type} about '{req.topic}'. The tone should be {req.tone}. Use clear markdown formatting with proper headings, sections, and structure."
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

# ─── EXTRA: Interview Prep ────────────────────────────────────

@app.post("/api/interview")
async def interview_prep(req: InterviewRequest):
    prompt = f"""You are an expert interview coach. Prepare a comprehensive interview prep guide for:
- Target Role: {req.role}
- Experience Level: {req.experience}
- Company Type: {req.company_type}

Include:
🎯 Top 10 most likely interview questions with model answers
💡 Behavioural questions (STAR format examples)
🧠 Technical concepts to revise
❓ Smart questions to ask the interviewer
🤝 Salary negotiation tips
⚡ Day-of-interview checklist

Be specific to the role and realistic."""
    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")


# ═══════════════════════════════════════════════════════════════
# NEW FEATURE 1: DATA PIPELINE (Ingest → Chunk → Embed → Store)
# ═══════════════════════════════════════════════════════════════

def chunk_text(text: str, chunk_size: int = 300) -> List[str]:
    """Split text into overlapping chunks for better retrieval."""
    words = text.split()
    chunks = []
    overlap = 50
    step = chunk_size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks

def preprocess_text(text: str) -> str:
    """Clean and normalize text from documents."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove non-printable chars
    text = re.sub(r'[^\x20-\x7E\n]', '', text)
    return text.strip()

@app.post("/api/pipeline/ingest-pdf")
async def ingest_pdf(file: UploadFile = File(...), chunk_size: int = Form(300)):
    """
    DATA PIPELINE: PDF → Extract → Clean → Chunk → Embed → ChromaDB
    Returns collection_id for use in RAG queries.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported.")

    # Step 1: Extract text from PDF
    contents = await file.read()
    reader = PyPDF2.PdfReader(io.BytesIO(contents))
    raw_text = ""
    for page in reader.pages:
        raw_text += page.extract_text() or ""

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    # Step 2: Preprocess (clean & normalize)
    cleaned_text = preprocess_text(raw_text)

    # Step 3: Chunk
    chunks = chunk_text(cleaned_text, chunk_size)

    # Step 4: Embed & store in ChromaDB
    collection_id = str(uuid.uuid4())[:8]
    collection = chroma_client.create_collection(
        name=f"doc_{collection_id}",
        embedding_function=embedding_fn,
    )

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": file.filename, "chunk_index": i} for i in range(len(chunks))]
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)

    # Step 5: Register
    rag_collections[collection_id] = {
        "name": file.filename,
        "collection_name": f"doc_{collection_id}",
        "chunk_count": len(chunks),
        "char_count": len(cleaned_text),
    }

    return {
        "collection_id": collection_id,
        "filename": file.filename,
        "chunks_created": len(chunks),
        "total_chars": len(cleaned_text),
        "status": "Pipeline complete — document indexed and ready for RAG queries.",
        "pipeline_steps": ["PDF text extraction", "Text preprocessing", f"Chunking ({chunk_size} words/chunk)", "Embedding generation", "ChromaDB storage"],
    }

@app.post("/api/pipeline/ingest-text")
async def ingest_text(req: PipelineTextRequest):
    """
    DATA PIPELINE: Raw text → Clean → Chunk → Embed → ChromaDB
    """
    cleaned = preprocess_text(req.text)
    chunks = chunk_text(cleaned, req.chunk_size)

    collection_id = str(uuid.uuid4())[:8]
    collection = chroma_client.create_collection(
        name=f"doc_{collection_id}",
        embedding_function=embedding_fn,
    )

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": req.source_name, "chunk_index": i} for i in range(len(chunks))]
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)

    rag_collections[collection_id] = {
        "name": req.source_name,
        "collection_name": f"doc_{collection_id}",
        "chunk_count": len(chunks),
        "char_count": len(cleaned),
    }

    return {
        "collection_id": collection_id,
        "source_name": req.source_name,
        "chunks_created": len(chunks),
        "status": "Text ingested and indexed.",
    }

@app.get("/api/pipeline/collections")
def list_collections():
    """List all indexed document collections."""
    return {"collections": [
        {"collection_id": cid, **meta}
        for cid, meta in rag_collections.items()
    ]}


# ═══════════════════════════════════════════════════════════════
# NEW FEATURE 2: RAG SYSTEM (Retrieve → Augment → Generate)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/rag/query")
async def rag_query(req: RAGQueryRequest):
    """
    RAG: Query → Semantic search in ChromaDB → Augment prompt → Stream answer
    """
    if req.collection_id not in rag_collections:
        raise HTTPException(status_code=404, detail="Collection not found. Ingest a document first.")

    collection_name = rag_collections[req.collection_id]["collection_name"]
    collection = chroma_client.get_collection(
        name=collection_name,
        embedding_function=embedding_fn,
    )

    # Retrieve top-k relevant chunks
    results = collection.query(query_texts=[req.question], n_results=min(req.top_k, collection.count()))
    retrieved_chunks = results["documents"][0] if results["documents"] else []

    if not retrieved_chunks:
        raise HTTPException(status_code=404, detail="No relevant content found.")

    context = "\n\n---\n\n".join(retrieved_chunks)
    source_name = rag_collections[req.collection_id]["name"]

    prompt = f"""You are an expert assistant answering questions strictly based on the provided document context.

Document: {source_name}
Context (retrieved relevant passages):
{context}

Question: {req.question}

Instructions:
- Answer using ONLY the information in the context above.
- If the answer is not in the context, say "I couldn't find that in the document."
- Be concise, accurate, and cite which part of the context supports your answer.
- Format the answer clearly with markdown."""

    return StreamingResponse(stream_prompt(prompt, req.provider), media_type="text/plain")

@app.get("/api/rag/collections/{collection_id}/info")
def collection_info(collection_id: str):
    if collection_id not in rag_collections:
        raise HTTPException(status_code=404, detail="Collection not found.")
    info = rag_collections[collection_id]
    collection = chroma_client.get_collection(
        name=info["collection_name"],
        embedding_function=embedding_fn,
    )
    return {**info, "collection_id": collection_id, "stored_chunks": collection.count()}


# ═══════════════════════════════════════════════════════════════
# NEW FEATURE 3: AGENTIC AI (Plan → Execute → Observe → Repeat)
# ═══════════════════════════════════════════════════════════════

AGENT_TOOLS = {
    "search_knowledge": "Search the AI's internal knowledge for facts, definitions, or explanations about a topic.",
    "analyze_problem": "Break down a complex problem into sub-problems and identify key components.",
    "generate_solution": "Generate a detailed solution, code, plan, or content for a specific sub-task.",
    "validate_output": "Check if the current solution meets the original goal and identify gaps.",
    "summarize_findings": "Compile all findings into a final coherent answer.",
}

async def agent_plan(goal: str, context: str, provider: str) -> dict:
    """Step 1: Agent plans which tools to use and in what order."""
    tools_desc = "\n".join([f"- {name}: {desc}" for name, desc in AGENT_TOOLS.items()])
    prompt = f"""You are an autonomous AI agent. Given a goal, create an execution plan.

Available tools:
{tools_desc}

Goal: {goal}
Context: {context or "None provided"}

Return ONLY a JSON object like:
{{
  "plan_summary": "One sentence describing the approach",
  "steps": [
    {{"step": 1, "tool": "tool_name", "action": "What specifically to do"}},
    {{"step": 2, "tool": "tool_name", "action": "What specifically to do"}}
  ]
}}

Use 3–5 steps maximum. Be specific."""
    raw = await get_completion(prompt, provider)
    raw = raw.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(raw)
    except Exception:
        return {"plan_summary": "Direct execution", "steps": [{"step": 1, "tool": "generate_solution", "action": goal}]}

async def agent_execute_step(goal: str, step: dict, previous_results: list, provider: str) -> str:
    """Step 2: Execute a single agent step."""
    prev_context = "\n".join([f"Step {i+1} result: {r[:500]}" for i, r in enumerate(previous_results)])
    prompt = f"""You are an AI agent executing a specific task step.

Original Goal: {goal}
Current Step: {step['action']}
Tool Being Used: {step['tool']}
Previous Steps Results:
{prev_context or "None yet"}

Execute this step thoroughly and return the result. Be specific and detailed."""
    return await get_completion(prompt, provider)

@app.post("/api/agent/run")
async def run_agent(req: AgentRequest):
    """
    AGENTIC AI: Goal → Plan → Multi-step execution → Stream progress + final answer
    """
    async def agent_stream():
        yield f"🤖 **Agent Started**\n**Goal:** {req.goal}\n\n"
        await asyncio.sleep(0.05)

        # Phase 1: Planning
        yield "⚙️ **Phase 1: Planning...**\n"
        plan = await agent_plan(req.goal, req.context, req.provider)
        yield f"📋 **Plan:** {plan.get('plan_summary', 'Multi-step execution')}\n\n"
        steps = plan.get("steps", [])[:req.max_steps]
        for s in steps:
            yield f"  → Step {s['step']}: [{s['tool']}] {s['action']}\n"
        yield "\n"
        await asyncio.sleep(0.05)

        # Phase 2: Execution
        yield "⚡ **Phase 2: Executing Steps...**\n\n"
        results = []
        for step in steps:
            yield f"**Step {step['step']}: {step['action']}**\n"
            result = await agent_execute_step(req.goal, step, results, req.provider)
            results.append(result)
            yield f"{result}\n\n---\n\n"
            await asyncio.sleep(0.05)

        # Phase 3: Synthesize final answer
        yield "🔗 **Phase 3: Synthesizing Final Answer...**\n\n"
        all_results = "\n\n".join([f"Step {i+1}: {r}" for i, r in enumerate(results)])
        synthesis_prompt = f"""Given the following multi-step agent execution results, synthesize a clear, complete, final answer to the original goal.

Goal: {req.goal}

Execution Results:
{all_results}

Provide a well-structured, comprehensive final answer that directly addresses the goal."""

        async for chunk in stream_prompt(synthesis_prompt, req.provider):
            yield chunk

        yield "\n\n✅ **Agent task complete.**"

    return StreamingResponse(agent_stream(), media_type="text/plain")

@app.post("/api/agent/plan-only")
async def agent_plan_only(req: AgentRequest):
    """Preview the agent's plan without executing it."""
    plan = await agent_plan(req.goal, req.context, req.provider)
    return plan
