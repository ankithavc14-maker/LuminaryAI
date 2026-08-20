# LuminaryAI Studio - Quick Setup Guide

## What You Have
This is the **complete LuminaryAI Studio v3** combining:
- ✅ All original Day 1-4 productivity features
- ✅ New v3 AI engineering features (RAG, Agents, Data Pipeline)
- ✅ Dual provider support (Gemini + OpenAI)

## Prerequisites
- Python 3.8+ ([download](https://www.python.org/downloads/))
- Node.js 16+ ([download](https://nodejs.org/))
- Gemini API key (free, takes 2 min)
- OpenAI API key (optional, for dual-provider)

## Step 1: Get API Keys (2 minutes)

### Gemini API Key (Free)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy the key
4. Paste into `.env` as `GEMINI_API_KEY`

### OpenAI API Key (Optional)
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Paste into `.env` as `OPENAI_API_KEY`

## Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies (includes ChromaDB, PDF support, etc.)
pip install -r requirements.txt
```

**Note:** First install downloads ~400MB for sentence-transformers model (one-time)

## Step 3: Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install
```

## Step 4: Configuration

```bash
# Go back to project root
cd ..

# Copy example config to actual config
cp .env.example .env

# Edit .env and add your API keys
# On macOS/Linux:
nano .env
# On Windows:
notepad .env
```

Your `.env` should look like:
```env
GEMINI_API_KEY="your_actual_key_here"
OPENAI_API_KEY="your_actual_key_here"  # optional
```

## Step 5: Run the Application

Open **two terminal windows** in the project folder:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

Wait for: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## Step 6: Open in Browser

Visit: **http://localhost:5173**

You should see the LuminaryAI interface with all features ready.

## What to Try First

1. **Day 1 - Chatbot**: Quick test with AI responses
2. **Day 2 - Summarizer**: Paste some text, see magic
3. **RAG System**: Upload a PDF, ask questions about it
4. **Agent AI**: Give it a complex task, watch it plan & execute
5. **Data Pipeline**: Ingest your own documents

## Troubleshooting

### "ModuleNotFoundError: No module named..."
```bash
# Backend terminal:
pip install -r requirements.txt
# Make sure virtual environment is activated
```

### "Port 8000 already in use"
```bash
# Find process on 8000 and kill it, or use different port:
uvicorn main:app --reload --port 8001
# Then update frontend API calls to port 8001
```

### "Cannot find module 'react'" or npm errors
```bash
# Frontend terminal:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API calls failing
1. Check `.env` file has valid keys
2. Check backend terminal for error messages
3. Verify both backend and frontend are running
4. Check browser console (F12) for error details

### ChromaDB/PDF upload issues
- Ensure PDF file is valid (not corrupted)
- File should be under 50MB
- ChromaDB creates data in backend folder automatically

## File Structure

```
LuminaryAI_Combined/
├── backend/
│   ├── main.py              # All API endpoints
│   ├── requirements.txt      # Python packages
│   └── venv/               # Virtual environment (after setup)
├── frontend/
│   ├── src/
│   │   ├── pages/          # All feature pages
│   │   ├── components/     # UI components
│   │   └── App.jsx         # Main router
│   ├── node_modules/       # npm packages (after npm install)
│   └── package.json
├── .env                    # Your API keys (create from .env.example)
├── README.md              # Full documentation
└── SETUP.md              # This file
```

## Next Steps

### For Learning
- Explore each Day feature to understand prompt engineering
- Try RAG System with your own PDFs
- Experiment with Agent AI for complex tasks

### For Development
- Backend: Add new endpoints to `backend/main.py`
- Frontend: Add pages to `frontend/src/pages/`
- Update routing in `frontend/src/App.jsx`

### For Production
- Switch from `--reload` to production mode
- Use environment-specific `.env` files
- Set up proper error logging
- Configure CORS for your domain

## Need Help?

1. **Backend errors?** Check the backend terminal output
2. **Frontend errors?** Open browser DevTools (F12)
3. **API not responding?** Verify .env keys are valid
4. **Installation stuck?** Internet connection, or reinstall Python

## Success Indicators

✅ Backend terminal shows "Uvicorn running..."
✅ Frontend terminal shows "Local: http://localhost:5173/"
✅ Browser loads LuminaryAI interface
✅ Sidebar shows all features
✅ Clicking a feature doesn't show errors

**You're ready to go! 🚀**

---

**Tips:**
- Keep both terminal windows visible while developing
- Backend auto-reloads on code changes
- Frontend hot-reloads on code changes
- Check browser console (F12) for frontend errors
- Check backend terminal for API errors
