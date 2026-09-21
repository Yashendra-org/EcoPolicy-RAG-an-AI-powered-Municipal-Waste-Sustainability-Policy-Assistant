export interface BylawDocument {
  id: string;
  title: string;
  category: 'Waste Management' | 'Energy & Buildings' | 'Water & Stormwater' | 'Hazardous & E-Waste' | 'Urban Ecology';
  code: string;
  effectiveDate: string;
  summary: string;
  content: string;
  chunksCount: number;
}

export interface Chunk {
  id: string;
  documentId: string;
  documentTitle: string;
  clause: string;
  text: string;
  similarityScore?: number;
}

export interface RAGMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  retrievedChunks?: Chunk[];
  processingTimeMs?: number;
  modelUsed?: string;
  guardrailTriggered?: boolean;
}

export interface VectorStoreStats {
  totalDocuments: number;
  totalChunks: number;
  embeddingModel: string;
  vectorDimension: number;
  chunkSize: number;
  chunkOverlap: number;
  storeStatus: 'Ready' | 'Indexing' | 'Error';
}
