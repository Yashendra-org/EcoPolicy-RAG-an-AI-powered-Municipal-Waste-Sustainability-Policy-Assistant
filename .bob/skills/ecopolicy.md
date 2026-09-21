---
name: ecopolicy
description: >
  Project-specific skill for the EcoPolicy RAG codebase. Activates context about
  the stack, architecture decisions, known quirks, and coding conventions for this project.
---

# EcoPolicy RAG — Project Skill

## Stack Quick Reference

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Node Backend | Express.js + TypeScript, run via `tsx` — Multi-Agent RAG Router |
| Python Backend | FastAPI (`uvicorn`) — Secure API at `http://127.0.0.1:8000` |
| LLM | Google Gemini 2.5 Flash (`@google/genai`) |
| Dev server | Vite (mounted as middleware inside Express) |
| Icons | `lucide-react` |
| Animation | `motion` (Framer Motion v11+) |
| Python tooling | FastAPI, LangChain, ChromaDB, sentence-transformers, slowapi |

## Key Files

- [`server.ts`](../../server.ts) — Express backend with **3-agent router**: Policy Agent (RAG), Complaint/Action Agent (ticket drafter), Education Agent (child-friendly explainer)
- [`src/App.tsx`](../../src/App.tsx) — Root SPA shell with tab routing
- [`src/types.ts`](../../src/types.ts) — Shared TypeScript interfaces (`BylawDocument`, `Chunk`, `RAGMessage`, `VectorStoreStats`)
- [`src/data/sampleBylaws.ts`](../../src/data/sampleBylaws.ts) — Seed bylaw documents (4 docs, 4 categories)
- [`src/components/ChatInterface.tsx`](../../src/components/ChatInterface.tsx) — Chat UI; now calls FastAPI at `http://127.0.0.1:8000/api/query`
- [`eval.py`](../../eval.py) — Standalone Python benchmark (does NOT connect to live server)

## Multi-Agent System

The `/api/chat` route in `server.ts` runs a 3-step agentic pipeline:

```
Query → Router Agent → intent detected
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      "policy"     "complaint"   "education"
     RAG Pipeline   Ticket Draft  Fun Explainer
     (ChromaDB +    (Gemini)      (Gemini emoji)
      Gemini)
```

**Router detection:**
- Gemini classifies intent if API key is present
- Keyword fallback: "complain/report/issue/ticket" → complaint; "child/kid/simple/explain to" → education

## API Security

The React frontend now talks to **FastAPI** (not directly to Express):
- **Endpoint:** `http://127.0.0.1:8000/api/query`
- **Auth header:** `X-API-Key: ECO_RAG_SECURE_KEY_2026`
- This key must match `API_SECRET_KEY` in the FastAPI backend config
- Rate limiting handled by `slowapi`

## Architecture Decisions & Known Quirks

1. **No real vector search in Node backend** — `retrieveRelevantChunks()` in `server.ts` is keyword frequency scoring. ChromaDB/HuggingFace embeddings are in the Python layer only.

2. **In-memory only (Node)** — `bylawsDB` and `allChunks` are runtime arrays. Server restart wipes ingested documents.

3. **`chunksCount` on seed data** — Bob fixed this: `chunksCount` is now dynamically recomputed at startup from actual `chunkText()` output.

4. **Vite + Express unified server** — In dev, Vite runs as Express middleware. In prod, `vite build` → `dist/` served as static files.

5. **Dual backends** — The Express Node server handles document ingestion, stats, and bylaw listing. The FastAPI Python server handles AI query routing. Both must be running for full functionality.

6. **Tailwind v4** — Uses `@import "tailwindcss"` in `src/index.css`. No `tailwind.config.js` needed.

7. **`animate-fadeIn`** — Bob defined this keyframe in `src/index.css`; Tailwind v4 doesn't auto-generate custom animation classes.

## Coding Conventions

- All React components are named exports (`export const Foo: React.FC<Props>`)
- API calls use `fetch` with explicit error handling — no axios
- No external state management — plain `useState`/`useEffect`
- Tailwind utility-first; no CSS modules
- TypeScript strict mode via `tsconfig.json`

## Run Commands

```bash
# Node frontend + Express multi-agent backend
npm run dev          # → http://localhost:3000

# Python FastAPI backend (must run in separate terminal)
cd backend           # or wherever main.py lives
uvicorn main:app --reload --port 8000

# Build for production
npm run build
npm run start

# TypeScript typecheck
npm run lint

# Python RAG evaluation benchmark
python eval.py
```

## Created & Maintained By

**IBM Bob** — AI Software Engineer
Powered by IBM watsonx
