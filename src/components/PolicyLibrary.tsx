import React, { useState } from 'react';
import { BookOpen, Search, Filter, Calendar, FileText, Layers, CheckCircle2, X } from 'lucide-react';
import { BylawDocument } from '../types';

interface PolicyLibraryProps {
  bylaws: BylawDocument[];
  onIngestClick: () => void;
}

export const PolicyLibrary: React.FC<PolicyLibraryProps> = ({ bylaws, onIngestClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeBylaw, setActiveBylaw] = useState<BylawDocument | null>(null);

  const categories = ['All', 'Waste Management', 'Energy & Buildings', 'Water & Stormwater', 'Hazardous & E-Waste'];

  const filteredBylaws = bylaws.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Official Bylaw & Policy Library</h1>
          <p className="text-sm text-stone-600">
            Browse verified municipal bylaws, sustainability handbooks, and environmental regulations indexed in ChromaDB.
          </p>
        </div>
        <button
          onClick={onIngestClick}
          className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm self-start md:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>Ingest New Bylaw PDF</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, code, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-stone-500 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-950 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bylaws Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBylaws.map((bylaw) => (
          <div
            key={bylaw.id}
            onClick={() => setActiveBylaw(bylaw)}
            className="bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                  {bylaw.code}
                </span>
                <span className="text-xs text-stone-500 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Effective {bylaw.effectiveDate}</span>
                </span>
              </div>

              <h2 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors mb-2">
                {bylaw.title}
              </h2>
              <p className="text-sm text-stone-600 mb-4 line-clamp-3">
                {bylaw.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md font-medium">
                {bylaw.category}
              </span>
              <span className="font-mono text-emerald-700 font-semibold flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5" />
                <span>{bylaw.chunksCount} Vector Chunks</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredBylaws.length === 0 && (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-700">No bylaws found</h3>
          <p className="text-sm text-stone-500">Try adjusting your search filter or ingest a new document.</p>
        </div>
      )}

      {/* Bylaw Detail Modal */}
      {activeBylaw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-mono bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">
                    {activeBylaw.code}
                  </span>
                  <span className="text-xs text-emerald-300">• {activeBylaw.category}</span>
                </div>
                <h2 className="text-xl font-bold">{activeBylaw.title}</h2>
              </div>
              <button
                onClick={() => setActiveBylaw(null)}
                className="w-10 h-10 rounded-full bg-emerald-900 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 text-sm leading-relaxed">
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">Executive Summary</h4>
                <p className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-stone-700 font-medium">
                  {activeBylaw.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">Full Legislative Text & Clauses</h4>
                <div className="bg-stone-900 text-stone-100 p-5 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                  {activeBylaw.content}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Indexed into ChromaDB with {activeBylaw.chunksCount} semantic chunks.</span>
                </div>
                <span className="font-mono">Effective: {activeBylaw.effectiveDate}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setActiveBylaw(null)}
                className="bg-stone-800 hover:bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
