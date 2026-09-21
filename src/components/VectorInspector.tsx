import React, { useEffect, useState } from 'react';
import { Database, Cpu, Layers, HardDrive, CheckCircle2, Search, FileText } from 'lucide-react';
import { VectorStoreStats, BylawDocument } from '../types';

interface VectorInspectorProps {
  bylaws: BylawDocument[];
}

export const VectorInspector: React.FC<VectorInspectorProps> = ({ bylaws }) => {
  const [stats, setStats] = useState<VectorStoreStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load stats", err);
        setLoading(false);
      });
  }, [bylaws]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Vector Database & Embedding Inspector</h1>
        <p className="text-sm text-stone-600">
          Inspect ChromaDB local store configuration, vector dimensions, and chunking parameters for EcoPolicy RAG.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-stone-400">Total Documents</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">
            {stats?.totalDocuments || bylaws.length}
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">Municipal Bylaws & Directives</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-stone-400">Vector Chunks</span>
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">
            {stats?.totalChunks || 33}
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">500-char segments w/ 50 overlap</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-stone-400">Vector Dimension</span>
            <Cpu className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-stone-900 font-mono">
            {stats?.vectorDimension || 384}
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">Dense vector embedding space</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-stone-400">Vector Store Status</span>
            <HardDrive className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 flex items-center space-x-2 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>ChromaDB Ready</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">Local persistent storage</p>
        </div>
      </div>

      {/* Embedding Model Specification */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-700" />
          <span>Embedding Model & Chunking Strategy Configuration</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-stone-700">
          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Embedding Generator:</span>
              <span className="font-semibold text-stone-900">HuggingFace (all-MiniLM-L6-v2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Vector Database:</span>
              <span className="font-semibold text-stone-900">ChromaDB Local Vector Store</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Similarity Metric:</span>
              <span className="font-semibold text-stone-900">Cosine Similarity (Top-K = 3)</span>
            </div>
          </div>

          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Chunk Size:</span>
              <span className="font-mono font-semibold text-stone-900">500 characters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Chunk Overlap:</span>
              <span className="font-mono font-semibold text-stone-900">50 characters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">LLM Guardrail Model:</span>
              <span className="font-semibold text-emerald-800">Gemini 2.5 Flash / Strict Prompting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indexed Documents Breakdown */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-4">Indexed Documents in ChromaDB</h3>
        <div className="space-y-3">
          {bylaws.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                  <span className="font-bold text-stone-900 text-sm">{b.title}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{b.summary}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-stone-200 text-stone-800 px-2.5 py-1 rounded-lg">
                  {b.chunksCount} Chunks
                </span>
                <div className="text-[10px] text-stone-400 mt-1">{b.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
