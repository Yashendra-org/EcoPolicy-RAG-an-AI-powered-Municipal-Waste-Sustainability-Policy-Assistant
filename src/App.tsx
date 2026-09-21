import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { PolicyLibrary } from './components/PolicyLibrary';
import { VectorInspector } from './components/VectorInspector';
import { ArchitectureView } from './components/ArchitectureView';
import { IngestionModal } from './components/IngestionModal';
import { BylawDocument } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'library' | 'inspector' | 'architecture'>('chat');
  const [bylaws, setBylaws] = useState<BylawDocument[]>([]);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // BUG 14 FIX: source totalChunks from /api/stats (live server value) not from stale seed chunksCount fields
  const [totalChunks, setTotalChunks] = useState(0);

  const loadBylaws = () => {
    fetch('/api/bylaws')
      .then(res => res.json())
      .then(data => {
        setBylaws(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load bylaws", err);
        setLoading(false);
      });
  };

  const loadStats = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setTotalChunks(data.totalChunks ?? 0))
      .catch(() => {/* silent — header stat is non-critical */});
  };

  useEffect(() => {
    loadBylaws();
    loadStats();
  }, []);

  // Refresh stats whenever bylaws list changes (e.g. after ingestion)
  useEffect(() => {
    if (!loading) loadStats();
  }, [bylaws]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-stone-600">Initializing EcoPolicy RAG & ChromaDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalDocs={bylaws.length}
        totalChunks={totalChunks}
      />

      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatInterface onIngestClick={() => setIsIngestOpen(true)} />
        )}
        {activeTab === 'library' && (
          <PolicyLibrary bylaws={bylaws} onIngestClick={() => setIsIngestOpen(true)} />
        )}
        {activeTab === 'inspector' && (
          <VectorInspector bylaws={bylaws} />
        )}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      <IngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={loadBylaws}
      />
    </div>
  );
}
