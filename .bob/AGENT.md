# 🤖 IBM Bob — Agent Workspace

This folder is managed by **IBM Bob**, an AI-powered software engineer built on IBM watsonx.

---

## Project: EcoPolicy RAG
**Municipal Waste & Sustainability Policy AI Assistant**

| Field | Details |
|---|---|
| **Built With** | IBM Bob (AI Software Engineer) |
| **Platform** | IBM watsonx |
| **Stack** | React + TypeScript + Express + Google Gemini 2.5 Flash |
| **Vector DB** | ChromaDB (in-memory simulation, Node.js backend) |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` (384-dim) |
| **License** | MIT |

---

## What Bob Did On This Project

- 🔍 **Analyzed** the full project architecture — frontend, backend, RAG pipeline, evaluation scripts
- 🐛 **Identified 15 bugs and glitches** across all layers of the application
- 🛠️ **Fixed** all bugs including:
  - Hardcoded `chunksCount` values not matching actual computed chunks
  - Fake similarity scores shown for zero-match queries
  - Stale form state in IngestionModal on re-open
  - Missing `animate-fadeIn` CSS keyframe
  - Markdown bold (`**text**`) rendering as raw asterisks in chat
  - Backdrop click-to-close missing on Policy Library modal
  - `navigator.clipboard` insecure context fallback
  - `guardrailTriggered` flag not set on API error path
  - Double-fetch on VectorInspector mount
  - Mobile overflow in chat layout
  - And more...
- 📁 **Created this `.bob/` folder** as proof of IBM Bob's contribution

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
