import React, { useState } from 'react';
import { X, Layers, FileText, CheckCircle2, Upload, Sparkles, AlertCircle } from 'lucide-react';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// BUG 9 FIX: extract reset helper so form is always cleared on close
type CategoryType = 'Waste Management' | 'Energy & Buildings' | 'Water & Stormwater' | 'Hazardous & E-Waste' | 'Urban Ecology';

export const IngestionModal: React.FC<IngestionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Waste Management');
  const [code, setCode] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // BUG 9 FIX: reset all form fields when modal closes
  const resetForm = () => {
    setTitle('');
    setCategory('Waste Management');
    setCode('');
    setSummary('');
    setContent('');
    setSubmitting(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and policy content are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          code: code.trim() || `BY-2026-${Math.floor(Math.random() * 899 + 100)}`,
          summary: summary.trim() || title,
          content: content.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to ingest document');

      setSuccessMsg(`Successfully ingested "${title}" into ChromaDB with ${data.chunksCreated} vector chunks!`);
      setTimeout(() => {
        onSuccess();
        handleClose(); // BUG 9 FIX: reset form on success close
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to ingest document.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadSamplePreset = () => {
    setTitle('Municipal Urban Canopy & Tree Protection Bylaw 2026-T1');
    setCategory('Urban Ecology');
    setCode('BY-2026-T1');
    setSummary('Guidelines prohibiting unauthorized removal of mature trees, requiring 2-for-1 sapling replacement, and protecting urban biodiversity.');
    setContent(`
SECTION 1: TREE PRESERVATION & PERMIT REQUIREMENTS
1.1 No person shall cut down, destroy, or injure any tree having a diameter at breast height (DBH) of 20cm or greater without obtaining a Municipal Arborist Permit.
1.2 Unauthorized removal of a protected canopy tree shall result in a mandatory penalty of $500 per tree plus the cost of expert arboricultural appraisal.

SECTION 2: REPLACEMENT & COMPENSATION MANDATE
2.1 For every approved tree removal on private residential or commercial development lots, the property owner must plant two indigenous deciduous saplings (minimum 50mm caliper) or contribute $300 per tree to the Municipal Green Canopy Fund.
    `.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ingest Municipal Policy PDF / Text</h2>
              <p className="text-xs text-emerald-300">Parse text, chunk into 500-char segments, and index in ChromaDB</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-emerald-900 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-between items-center pb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase">Document Metadata</span>
            <button
              type="button"
              onClick={loadSamplePreset}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Canopy Bylaw Preset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1">Bylaw / Document Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Municipal Composting & Organic Directive"
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Bylaw Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BY-2026-X1"
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
              {/* BUG 10 FIX: proper type for select onChange */}
              <select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
              >
                <option value="Waste Management">Waste Management</option>
                <option value="Energy & Buildings">Energy & Buildings</option>
                <option value="Water & Stormwater">Water & Stormwater</option>
                <option value="Hazardous & E-Waste">Hazardous & E-Waste</option>
                <option value="Urban Ecology">Urban Ecology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Executive Summary</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of policy scope..."
                className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Raw Legislative Text / Clauses *</label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste official municipal policy text, sections, and clauses here..."
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-xs"
              required
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Note: The pipeline automatically splits text into 500-character chunks with 50-character overlap for embedding generation.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-medium flex items-center space-x-2 shadow-sm"
            >
              <Layers className="w-4 h-4" />
              <span>{submitting ? 'Indexing Chunks...' : 'Ingest & Index Bylaw'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
