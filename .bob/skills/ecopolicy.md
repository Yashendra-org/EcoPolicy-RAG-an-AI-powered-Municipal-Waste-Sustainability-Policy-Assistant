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
| Backend | Express.js, TypeScript, run via `tsx` |
| LLM | Google Gemini 2.5 Flash (`@google/genai`) |
| Dev server | Vite (mounted as middleware inside Express) |
| Icons | `lucide-react` |
| Animation | `motion` (Framer Motion v11+) |
| Python tooling | LangChain, ChromaDB, sentence-transformers (eval only) |

## Key Files

- [`server.ts`](../../server.ts) — Single-file Express backend. Contains chunker, keyword retriever, and all API routes.
- [`src/App.tsx`](../../src/App.tsx) — Root SPA shell with tab routing.
- [`src/types.ts`](../../src/types.ts) — Shared TypeScript interfaces (`BylawDocument`, `Chunk`, `RAGMessage`, `VectorStoreStats`).
- [`src/data/sampleBylaws.ts`](../../src/data/sampleBylaws.ts) — Seed bylaw documents (5 docs, 4 categories).
- [`eval.py`](../../eval.py) — Standalone Python benchmark (does NOT connect to live server).

## Architecture Decisions & Known Quirks

1. **No real vector search in Node backend** — `retrieveRelevantChunks()` in `server.ts` is keyword frequency scoring, not actual cosine similarity over embeddings. ChromaDB/HuggingFace are referenced in UI copy but only exist in the Python eval layer.

2. **In-memory only** — `bylawsDB` and `allChunks` are runtime arrays. Server restart wipes all ingested documents.

3. **`chunksCount` on seed data** — The `chunksCount` field in `sampleBylaws.ts` is manually set and must match what `chunkText()` actually produces. After Bob's fix, server startup recomputes these dynamically.

4. **Vite + Express unified server** — In dev mode, Vite runs as Express middleware. In prod, `vite build` outputs to `dist/` and Express serves static files.

5. **API key handling** — Gemini API key read from `process.env.GEMINI_API_KEY`. If missing or equals `"MY_GEMINI_API_KEY"`, falls back to a grounded text excerpt from the top retrieved chunk.

6. **Tailwind v4** — Uses `@import "tailwindcss"` in `src/index.css`. No `tailwind.config.js` needed. Custom keyframes (e.g., `animate-fadeIn`) must be defined in CSS.

## Coding Conventions

- All React components are named exports (`export const Foo: React.FC<Props>`)
- API calls use `fetch` with explicit error handling — no axios
- No external state management library — plain `useState`/`useEffect`
- Tailwind utility-first; no CSS modules
- TypeScript strict mode via `tsconfig.json`

## Run Commands

```bash
npm run dev      # Start dev server (Express + Vite HMR) → http://localhost:3000
npm run build    # Vite build + esbuild server bundle → dist/
npm run start    # Run production bundle
npm run lint     # tsc --noEmit typecheck
python eval.py   # Run Python RAG benchmark
```

## Created & Maintained By

**IBM Bob** — AI Software Engineer  
Powered by IBM watsonx  
