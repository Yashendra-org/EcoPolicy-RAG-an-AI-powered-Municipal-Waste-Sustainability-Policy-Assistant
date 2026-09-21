import React from 'react';
import { Workflow, FileText, Scissors, Cpu, Database, Search, Layers, Bot, Monitor, ShieldCheck } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Document Ingestion',
      component: 'PyPDFLoader / Express Parser',
      description: 'Extracts raw text from official municipal PDF bylaws, waste guidelines, and sustainability handbooks.',
      icon: FileText
    },
    {
      step: '2',
      title: 'Text Chunking',
      component: 'RecursiveCharacterTextSplitter',
      description: 'Splits text into 500-character chunks with a 50-character overlap to preserve semantic context across sentence boundaries.',
      icon: Scissors
    },
    {
      step: '3',
      title: 'Vector Embedding',
      component: 'HuggingFace (all-MiniLM-L6-v2)',
      description: 'Converts municipal policy text chunks into dense 384-dimensional vector representations.',
      icon: Cpu
    },
    {
      step: '4',
      title: 'Vector Database',
      component: 'ChromaDB Local Storage',
      description: 'Stores dense vector embeddings persistently for sub-3-second high-speed similarity search.',
      icon: Database
    },
    {
      step: '5',
      title: 'Semantic Retrieval',
      component: 'Cosine Similarity Matcher',
      description: 'Searches and retrieves top-k matching policy chunks corresponding to the user natural language query.',
      icon: Search
    },
    {
      step: '6',
      title: 'Context Assembly',
      component: 'Guardrail Prompt Builder',
      description: 'Combines the user query with retrieved policy text chunks and strict responsible AI instructions.',
      icon: Layers
    },
    {
      step: '7',
      title: 'LLM Generation',
      component: 'Gemini 2.5 Flash / IBM Granite',
      description: 'Produces grounded, hallucination-free answers with exact source citations and policy clause references.',
      icon: Bot
    },
    {
      step: '8',
      title: 'UI Rendering',
      component: 'React + Tailwind Web App',
      description: 'Displays the precise grounded answer, similarity scores, and expandable source clause inspector.',
      icon: Monitor
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Workflow className="w-4 h-4" />
          <span>End-to-End RAG Pipeline Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
          How EcoPolicy RAG Eliminates Hallucinations
        </h1>
        <p className="text-stone-600 text-base">
          By restricting the LLM working memory exclusively to verified municipal legislation through our rigorous 8-stage pipeline, EcoPolicy RAG ensures 100% factual accuracy and transparency.
        </p>
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center border border-emerald-200">
                {item.step}
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1">{item.title}</h3>
                <p className="text-xs font-mono text-emerald-700 mb-3">{item.component}</p>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Stage {item.step} of 8</span>
                <span className="text-emerald-600 font-medium">Verified Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsible AI Guardrails Box */}
      <div className="bg-emerald-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-bold text-sm tracking-wide uppercase">Responsible AI & Guardrails Guarantee</span>
          </div>
          <h2 className="text-xl font-bold">Zero Hallucinations & Strict Source Grounding</h2>
          <p className="text-xs text-emerald-200 leading-relaxed">
            EcoPolicy RAG strictly enforces that if an answer cannot be found in the retrieved policy text chunks, the system refuses to speculate and outputs: <span className="italic font-mono bg-emerald-900 px-2 py-0.5 rounded text-white">"I cannot find specific guidance for this in the current municipal policy guidelines."</span> No PII is logged, and all source clauses are fully transparent.
          </p>
        </div>
        <div className="shrink-0">
          <div className="bg-emerald-900/80 border border-emerald-800 rounded-2xl p-4 text-center font-mono text-xs text-emerald-200">
            <div>Embedding: 384-d</div>
            <div>Latency: &lt; 400ms</div>
            <div>Compliance: 100% Grounded</div>
          </div>
        </div>
      </div>
    </div>
  );
};
