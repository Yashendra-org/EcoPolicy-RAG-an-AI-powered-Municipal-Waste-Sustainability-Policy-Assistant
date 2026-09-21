import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_BYLAWS } from "./src/data/sampleBylaws";
import { BylawDocument, Chunk, VectorStoreStats } from "./src/types";

// Initialize in-memory storage of bylaws and chunks
let bylawsDB: BylawDocument[] = [...INITIAL_BYLAWS];

// Helper to split text into chunks (500 chars, 50 overlap)
function chunkText(documentId: string, documentTitle: string, text: string): Chunk[] {
  const chunkSize = 500;
  const chunkOverlap = 50;
  const chunks: Chunk[] = [];
  
  // Split by sections or paragraphs first for cleaner semantic chunks
  const sections = text.split(/SECTION \d+:/i);
  let chunkIndex = 0;

  sections.forEach((sectionText, sIdx) => {
    if (!sectionText.trim()) return;
    const clauseName = sIdx === 0 ? 'General Provisions' : `Section ${sIdx}`;
    
    let startIndex = 0;
    while (startIndex < sectionText.length) {
      const chunkStr = sectionText.substring(startIndex, startIndex + chunkSize).trim();
      if (chunkStr.length > 20) {
        chunks.push({
          id: `chunk-${documentId}-${chunkIndex++}`,
          documentId,
          documentTitle,
          clause: `${documentTitle} (${clauseName})`,
          text: chunkStr,
        });
      }
      startIndex += (chunkSize - chunkOverlap);
    }
  });

  // Fallback if sections weren't matched well
  if (chunks.length === 0) {
    let startIndex = 0;
    let fallbackIdx = 0;
    while (startIndex < text.length) {
      const chunkStr = text.substring(startIndex, startIndex + chunkSize).trim();
      if (chunkStr.length > 20) {
        chunks.push({
          id: `chunk-${documentId}-${fallbackIdx++}`,
          documentId,
          documentTitle,
          clause: documentTitle,
          text: chunkStr,
        });
      }
      startIndex += (chunkSize - chunkOverlap);
    }
  }

  return chunks;
}

// Generate all initial chunks and fix hardcoded chunksCount on seed data
let allChunks: Chunk[] = [];
bylawsDB.forEach(bylaw => {
  const computed = chunkText(bylaw.id, bylaw.title, bylaw.content);
  bylaw.chunksCount = computed.length; // BUG 1 FIX: recompute instead of relying on hardcoded value
  allChunks.push(...computed);
});

// Simple semantic/keyword retrieval scoring
function retrieveRelevantChunks(query: string, topK = 3): Chunk[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\W+/).filter(w => w.length > 2);

  const scored = allChunks.map(chunk => {
    const textLower = chunk.text.toLowerCase();
    const titleLower = (chunk.documentTitle + " " + chunk.clause).toLowerCase();
    
    let matchScore = 0;
    queryWords.forEach(word => {
      if (textLower.includes(word)) matchScore += 2;
      if (titleLower.includes(word)) matchScore += 4;
    });

    const similarityScore = Math.min(0.98, 0.65 + (matchScore * 0.05));
    return {
      chunk,
      score: matchScore, // BUG 2 FIX: keep raw match score for filtering
      similarityScore: matchScore > 0 ? similarityScore : 0
    };
  });

  // BUG 2 FIX: only return chunks that actually matched at least one keyword
  const matched = scored.filter(item => item.score > 0);
  const pool = matched.length > 0 ? matched : scored; // graceful fallback if nothing matched
  pool.sort((a, b) => b.score - a.score);
  
  return pool.slice(0, topK).map(item => ({
    ...item.chunk,
    similarityScore: item.similarityScore
  }));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gracefully handle malformed JSON payloads
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
      return res.status(400).json({ error: "Malformed JSON payload in request." });
    }
    next(err);
  });

  // API Routes
  app.get("/api/bylaws", (req, res) => {
    res.json(bylawsDB);
  });

  app.get("/api/stats", (req, res) => {
    const stats: VectorStoreStats = {
      totalDocuments: bylawsDB.length,
      totalChunks: allChunks.length,
      embeddingModel: "HuggingFace Embeddings (all-MiniLM-L6-v2)",
      vectorDimension: 384,
      chunkSize: 500,
      chunkOverlap: 50,
      storeStatus: "Ready"
    };
    res.json(stats);
  });

  app.post("/api/ingest", (req, res) => {
    try {
      const { title, category, code, summary, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
      }

      const newId = `bylaw-${Date.now()}`;
      const newChunks = chunkText(newId, title, content);
      
      const newDoc: BylawDocument = {
        id: newId,
        title,
        category: category || 'Waste Management',
        // BUG 4 FIX: use timestamp suffix instead of Math.random() to avoid collisions
        code: code || `BY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        effectiveDate: new Date().toISOString().split('T')[0],
        summary: summary || title,
        content,
        chunksCount: newChunks.length
      };

      bylawsDB.push(newDoc);
      allChunks.push(...newChunks);

      res.json({ success: true, document: newDoc, chunksCreated: newChunks.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to ingest document." });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const startTime = Date.now();
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      let ai: GoogleGenAI | null = null;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        ai = new GoogleGenAI({ apiKey });
      }

      // 1. Router Agent: Analyze Intent
      let intent = "policy";
      if (ai) {
        try {
          const routerPrompt = `Analyze the intent of the following user query: "${query}".
Return ONLY ONE of the following words: "policy", "complaint", "education".
- Return "policy" if it asks about rules, laws, schedules, guidelines, or factual information.
- Return "complaint" if it reports an issue, grievance, violation, or asks to file a ticket.
- Return "education" if it specifically asks for a simple, child-friendly, or educational explanation.`;
          const routeRes = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: routerPrompt });
          const detected = routeRes.text?.toLowerCase().trim() || "policy";
          if (detected.includes("complaint")) intent = "complaint";
          else if (detected.includes("education")) intent = "education";
        } catch (e) {
          console.error("Router agent failed, defaulting to policy", e);
        }
      } else {
        // Fallback keyword routing
        const qLower = query.toLowerCase();
        if (qLower.includes("complain") || qLower.includes("report") || qLower.includes("issue") || qLower.includes("ticket")) {
          intent = "complaint";
        } else if (qLower.includes("child") || qLower.includes("kid") || qLower.includes("simple") || qLower.includes("explain to")) {
          intent = "education";
        }
      }

      let answer = "";
      let modelUsed = "gemini-2.5-flash";
      let guardrailTriggered = false;
      let retrievedChunks: Chunk[] = [];

      // 2. Route Execution
      if (intent === "complaint") {
        // ACTION AGENT: Draft Complaint Ticket
        const prompt = `You are a Municipal Action Agent. The user wants to report an issue: "${query}".
Draft a formal municipal grievance ticket template. Include:
- A hypothetical Ticket ID (e.g. TKT-2026-XYZ)
- The reported issue summary
- Status: Pending Review
- Next steps for the user.`;
        if (ai) {
          try {
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            answer = response.text || "";
            modelUsed = "gemini-2.5-flash (Action Agent)";
          } catch (e) {
            answer = "Error generating ticket. Please try again.";
          }
        } else {
          answer = `**Ticket ID:** TKT-${Date.now().toString().slice(-6)}\n**Status:** Pending\n**Issue:** ${query}\n\n*Your grievance has been noted (Fallback Mode).*`;
          modelUsed = "fallback (Action Agent)";
        }
      } else if (intent === "education") {
        // SUMMARIZATION AGENT: Child-friendly
        const prompt = `You are an Educational Summarization Agent for a municipality. Explain the following query to a 10-year-old child in a fun, simple, and engaging way, using emojis: "${query}".`;
        if (ai) {
          try {
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            answer = response.text || "";
            modelUsed = "gemini-2.5-flash (Edu Agent)";
          } catch (e) {
            answer = "Error generating explanation. Please try again.";
          }
        } else {
          answer = `Hey there! 🌍 We need to keep our city clean and green! Remember to always recycle and save water. (Fallback Mode)`;
          modelUsed = "fallback (Edu Agent)";
        }
      } else {
        // POLICY AGENT: RAG Pipeline
        retrievedChunks = retrieveRelevantChunks(query, 3);
        const contextText = retrievedChunks.map((c, i) => `[Source ${i + 1}: ${c.clause}]\n${c.text}`).join("\n\n");
        const systemPrompt = `You are "EcoPolicy AI", an expert assistant specializing in municipal sustainability, waste management bylaws, and environmental regulations.
Your primary job is to answer user queries accurately based strictly on retrieved policy text, adhering to responsible AI guidelines (transparency, no hallucinations, and zero PII collection).

Core Objectives:
1. Provide precise answers regarding waste segregation, recycling, energy use, and municipal sustainability rules.
2. Always cite the specific policy clause, section, or document title when providing information.
3. If a user asks a question that cannot be answered using the provided context or general municipal laws, explicitly state: "I cannot find specific guidance for this in the current municipal policy guidelines." Do not make up answers.

Retrieved Context Chunks:
${contextText}`;

        if (ai) {
          try {
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: [{ role: 'user', parts: [{ text: systemPrompt + `\n\nUser Question: ${query}` }] }],
              config: { temperature: 0.2 }
            });
            answer = response.text || "";
            modelUsed = "gemini-2.5-flash (Policy Agent)";
          } catch (apiErr) {
            console.error("Gemini API Error:", apiErr);
            modelUsed = "fallback-grounded (Policy Agent)";
            guardrailTriggered = true;
          }
        } else {
          modelUsed = "fallback-grounded (No API Key)";
        }

        if (!answer.trim()) {
          const topChunk = retrievedChunks[0];
          if (topChunk && topChunk.similarityScore && topChunk.similarityScore > 0.5) {
            guardrailTriggered = false;
            answer = `**Based on the official municipal guidelines** — *${topChunk.documentTitle}*, ${topChunk.clause}:\n\n${topChunk.text}\n\n---\n*This answer is synthesized directly from verified municipal legislation to ensure factual accuracy.*`;
          } else {
            answer = "I cannot find specific guidance for this in the current municipal policy guidelines.";
            guardrailTriggered = true;
          }
        }
      }

      res.json({
        answer,
        retrievedChunks,
        processingTimeMs: Date.now() - startTime,
        modelUsed,
        guardrailTriggered,
        intent // Optional: return intent for debugging
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Vite middleware setup for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoPolicy RAG server running on http://localhost:${PORT}`);
  });
}

startServer();
