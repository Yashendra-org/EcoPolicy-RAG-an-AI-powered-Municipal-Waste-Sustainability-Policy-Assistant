import React from 'react';
import { Leaf, MessageSquare, BookOpen, Database, Workflow, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'library' | 'inspector' | 'architecture';
  setActiveTab: (tab: 'chat' | 'library' | 'inspector' | 'architecture') => void;
  totalDocs: number;
  totalChunks: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, totalDocs, totalChunks }) => {
  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner">
              <Leaf className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">EcoPolicy RAG</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700 font-medium">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 hidden sm:block">
                Municipal Sustainability & Bylaw Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">RAG Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'library'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Bylaw Library</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'inspector'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden md:inline">Vector DB</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span className="hidden md:inline">Architecture</span>
            </button>
          </nav>

          {/* System status badge */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-emerald-900/80 px-3 py-1.5 rounded-lg border border-emerald-800">
            <div className="flex items-center space-x-1.5 text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounded RAG Active</span>
            </div>
            <span className="text-emerald-500">•</span>
            <span className="text-emerald-200 font-mono">{totalDocs} Docs ({totalChunks} Chunks)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
