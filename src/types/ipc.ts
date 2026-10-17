export type SupportedFileType = "pdf" | "markdown" | "txt";

export type IngestionStatus = "uploading" | "chunking" | "embedding" | "ready" | "error";

export interface SourceDocument {
  id: string;
  name: string;
  fileType: SupportedFileType;
  byteSize: number;
  chunkCount: number;
  uploadedAt: string;
  selected: boolean;
  status?: IngestionStatus;
  progress?: number;
}

export interface CitationRef {
  citationIndex: number;
  sourceId: string;
  sourceName: string;
  pageNumber?: number;
  snippet: string;
  relevanceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationRef[];
  timestamp: string;
}

export interface IngestResponse {
  success: boolean;
  source?: SourceDocument;
  error?: string;
}

export interface QueryRagRequest {
  query: string;
  selectedSourceIds: string[];
}

export type LlmProviderType = "ollama" | "gemini" | "openai";

export interface LlmConfig {
  provider: LlmProviderType;
  endpointUrl: string;
  modelName: string;
  apiKey?: string;
  temperature: number;
}
