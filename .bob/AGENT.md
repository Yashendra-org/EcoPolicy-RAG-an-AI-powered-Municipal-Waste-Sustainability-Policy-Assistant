# 🤖 IBM Bob — Agent Workspace

This folder is managed by **IBM Bob**, an AI-powered software engineer built on IBM watsonx.

---

## Project: EcoPolicy RAG
**Municipal Waste & Sustainability Policy AI Assistant**

| Field | Details |
|---|---|
| **Built & Maintained By** | IBM Bob (AI Software Engineer) |
| **Platform** | IBM watsonx |
| **Frontend Stack** | React + TypeScript + Tailwind CSS + Vite |
| **Node Backend** | Express.ts — Multi-Agent RAG Router |
| **Python Backend** | FastAPI (`http://127.0.0.1:8000`) — Secure RAG API |
| **LLM** | Google Gemini 2.5 Flash |
| **Vector DB** | ChromaDB (in-memory Node sim + Python full impl) |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` (384-dim) |
| **License** | MIT |

---

## Current Architecture (Updated)

```
User Query (React UI)
        │
        ▼
FastAPI Backend  ←── X-API-Key: ECO_RAG_SECURE_KEY_2026
(127.0.0.1:8000/api/query)
        │
        ▼
Express Node Server (server.ts)
        │
        ▼
  ┌─────────────────────────────────┐
  │     ROUTER AGENT (Gemini)       │
  │  Detects intent from query      │
  │  → "policy" / "complaint" /     │
  │    "education"                  │
  └───────────┬─────────────────────┘
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
POLICY    COMPLAINT   EDUCATION
AGENT     AGENT       AGENT
(RAG      (Ticket     (Child-
Pipeline) Drafter)    friendly)
    │
    ▼
ChromaDB Keyword Retrieval (Top-K=3)
    │
    ▼
Gemini 2.5 Flash → Grounded Answer + Citations
```

---

## What Bob Did On This Project

### 🔍 Analysis
- Analyzed full project architecture — frontend, backend, RAG pipeline, evaluation scripts

### 🐛 Bug Fixes (14 bugs fixed by Bob)
| # | File | Bug | Fix |
|---|---|---|---|
| 1 | `server.ts` | `chunksCount` hardcoded in seed data | Recompute dynamically at startup |
| 2 | `server.ts` | Zero-match queries returned 0.40 fake similarity score | Filter to matched chunks only |
| 3 | `server.ts` | `guardrailTriggered` not set on API error | Fixed flag logic on catch |
| 4 | `server.ts` | `Math.random()` bylaw codes could collide | Switched to timestamp-based codes |
| 5 | `ChatInterface.tsx` | `**bold**` rendered as raw asterisks | Added `renderMarkdown()` inline renderer |
| 6 | `ChatInterface.tsx` | Query chips not disabled during loading | Added `disabled={loading}` to chips |
| 7 | `ChatInterface.tsx` | `navigator.clipboard` no fallback | Added `execCommand('copy')` fallback |
| 8 | `ChatInterface.tsx` | `createObjectURL` never revoked | Added `URL.revokeObjectURL()` |
| 9 | `IngestionModal.tsx` | Form not reset on close | Added `resetForm()` + `handleClose()` |
| 10 | `IngestionModal.tsx` | `select onChange` typed as `any` | Fixed to `React.ChangeEvent<HTMLSelectElement>` |
| 11 | `PolicyLibrary.tsx` | Backdrop click didn't close modal | Added `onClick` on backdrop + `stopPropagation` |
| 12 | `VectorInspector.tsx` | `useEffect` deps caused double-fetch | Changed deps to `[]` |
| 13 | `index.css` | `animate-fadeIn` keyframe missing | Defined `@keyframes fadeIn` |
| 14 | `App.tsx` | `totalChunks` from stale seed values | Now fetched live from `/api/stats` |

### 📦 Maintenance
- Fixed **duplicate entries** in `requirements.txt` (langchain, sentence-transformers, chromadb were listed twice with conflicting version pins)
- Cleaned and reorganized `requirements.txt` into logical sections

### 🆕 External Changes Detected & Documented
The following changes were made **externally** (outside Bob) and are now reflected here:

| File | What Changed |
|---|---|
| `server.ts` | **Major upgrade** — added 3-agent router (Policy, Complaint, Education) with Gemini intent detection + keyword fallback routing |
| `ChatInterface.tsx` | API endpoint switched from `/api/chat` → `http://127.0.0.1:8000/api/query` (FastAPI backend); added `X-API-Key` header; updated response mapping for FastAPI schema |
| `requirements.txt` | FastAPI, uvicorn, pydantic, slowapi added; duplicate package entries introduced (fixed by Bob) |

---

## Multi-Agent System (New)

| Agent | Trigger | Action |
|---|---|---|
| **Router Agent** | Every query | Detects intent via Gemini or keyword fallback |
| **Policy Agent** | `intent = "policy"` | Full RAG pipeline — ChromaDB retrieval → Gemini grounded answer |
| **Action/Complaint Agent** | `intent = "complaint"` | Drafts a formal municipal grievance ticket with Ticket ID |
| **Education Agent** | `intent = "education"` | Generates child-friendly emoji explanation |

---

## API Key Note ⚠️
The frontend now sends requests to the **FastAPI server** at `http://127.0.0.1:8000/api/query` with:
```
X-API-Key: ECO_RAG_SECURE_KEY_2026
```
This key must match the `API_SECRET_KEY` configured in the FastAPI backend.

---

## Run Commands

```bash
# Node frontend + Express backend
npm run dev          # → http://localhost:3000

# Python FastAPI backend (must run separately)
uvicorn main:app --reload --port 8000

# Python eval benchmark
python eval.py
```

---

## Bob Signature

```
  ██████╗  ██████╗ ██████╗
  ██╔══██╗██╔═══██╗██╔══██╗
  ██████╔╝██║   ██║██████╔╝
  ██╔══██╗██║   ██║██╔══██╗
  ██████╔╝╚██████╔╝██████╔╝
  ╚═════╝  ╚═════╝ ╚═════╝
  IBM Bob — AI Software Engineer
  Powered by IBM watsonx
```

> *"Every changed line traces directly to the user's request."*
> — IBM Bob Engineering Principle
