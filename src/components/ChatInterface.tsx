import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, CheckCircle2, ShieldAlert, Cpu, ChevronDown, ChevronUp, RefreshCw, Layers, Download, Copy, Check } from 'lucide-react';
import { RAGMessage, Chunk } from '../types';

interface ChatInterfaceProps {
  onIngestClick: () => void;
}

const SAMPLE_QUERIES = [
  "What are the rules for organic green bin contamination?",
  "How should commercial restaurants handle cooking oil and grease?",
  "What are the lawn watering schedules and restrictions?",
  "Where can residents dispose of rechargeable lithium-ion batteries?",
  "Are new commercial developments required to install solar panels?"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onIngestClick }) => {
  const [messages, setMessages] = useState<RAGMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Hello! I am **EcoPolicy AI**, your expert municipal sustainability and waste management bylaws assistant. I use verified municipal policy documents with Retrieval-Augmented Generation (RAG) to provide exact, factual answers with clause citations.\n\nAsk me any question about recycling, green building codes, water restrictions, or hazardous waste disposal!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-2.5-flash',
      retrievedChunks: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedChunksMsgId, setExpandedChunksMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: RAGMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate response');

      const assistantMsg: RAGMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedChunks: data.retrievedChunks || [],
        processingTimeMs: data.processingTimeMs,
        modelUsed: data.modelUsed,
        guardrailTriggered: data.guardrailTriggered
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: RAGMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Error connecting to RAG pipeline**: ${err.message || 'Please check connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedChunks: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadChat = () => {
    let mdContent = `# EcoPolicy RAG - Conversation Export\n`;
    mdContent += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;

    messages.forEach((msg) => {
      const role = msg.sender === 'user' ? '### User Query' : '### EcoPolicy AI';
      mdContent += `${role} (${msg.timestamp})\n\n${msg.text}\n\n`;
      if (msg.retrievedChunks && msg.retrievedChunks.length > 0) {
        mdContent += `**Verified Sources & Citations:**\n`;
        msg.retrievedChunks.forEach((c, idx) => {
          mdContent += `- [Source ${idx + 1}: ${c.clause}] (Similarity: ${c.similarityScore ? (c.similarityScore * 100).toFixed(0) + '%' : 'N/A'})\n  > "${c.text}"\n`;
        });
        mdContent += `\n`;
      }
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecopolicy-chat-${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Banner / Disclaimer */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-emerald-900 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold">Grounded RAG Guardrail Active:</span> Answers are derived strictly from municipal bylaws to prevent hallucinations.
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleDownloadChat}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-medium transition-colors shadow-xs"
            title="Export conversation as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Download Chat</span>
          </button>
          <button
            onClick={onIngestClick}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ingest Policy PDF</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasChunks = msg.retrievedChunks && msg.retrievedChunks.length > 0;
          const isChunksExpanded = expandedChunksMsgId === msg.id;

          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isUser ? 'bg-emerald-700 text-white' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed ${
                isUser 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-none'
              }`}>
                {/* Message Header info */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 text-xs text-stone-500">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-emerald-800">EcoPolicy AI</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 transition-colors text-[11px]"
                        title="Copy answer to clipboard"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      {msg.modelUsed && (
                        <div className="flex items-center space-x-1.5 font-mono bg-stone-100 px-2 py-0.5 rounded text-[11px] text-stone-600">
                          <Cpu className="w-3 h-3 text-emerald-600" />
                          <span>{msg.modelUsed}</span>
                          {msg.processingTimeMs && <span>({msg.processingTimeMs}ms)</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text}
                </div>

                {/* Retrieved Sources & Chunks Toggle */}
                {!isUser && hasChunks && (
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => setExpandedChunksMsgId(isChunksExpanded ? null : msg.id)}
                      className="flex items-center justify-between w-full text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/80 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Verified Source Citations & Retrieved Chunks ({msg.retrievedChunks?.length})</span>
                      </div>
                      {isChunksExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isChunksExpanded && (
                      <div className="mt-3 space-y-2.5 animate-fadeIn">
                        {msg.retrievedChunks?.map((chunk, cIdx) => (
                          <div key={chunk.id || cIdx} className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs">
                            <div className="flex items-center justify-between pb-1 mb-1 border-b border-stone-200">
                              <span className="font-semibold text-stone-800 flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Source {cIdx + 1}: {chunk.clause}</span>
                              </span>
                              {chunk.similarityScore && (
                                <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Similarity: {(chunk.similarityScore * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                            <p className="text-stone-600 italic font-mono text-[11px] bg-white p-2 rounded border border-stone-100">
                              "{chunk.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isUser && (
                  <div className="text-[10px] text-emerald-100 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-300 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm text-sm text-stone-600 flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Searching ChromaDB vector store & querying Gemini RAG pipeline...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-3">
        <p className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">Suggested Municipal Policy Queries:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition-all shadow-xs text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="mt-2 bg-white border border-stone-200 rounded-2xl p-2 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about municipal waste bylaws, energy codes, or water rules..."
            className="flex-1 px-4 py-2.5 text-sm focus:outline-none text-stone-800 placeholder-stone-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2 transition-colors shadow-sm"
          >
            <span>Ask RAG</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
