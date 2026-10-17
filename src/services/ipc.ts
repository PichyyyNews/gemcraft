import { invoke } from "@tauri-apps/api/core";
import type {
  SourceDocument,
  ChatMessage,
  IngestResponse,
  QueryRagRequest,
  LlmConfig,
  CitationRef,
} from "../types/ipc";

const isTauriEnvironment = (): boolean => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

// Initial in-memory mock repository for browser testing
let mockSources: SourceDocument[] = [
  {
    id: "src-rag-architecture",
    name: "ARCHITECTURE_AND_ROADMAP.md",
    fileType: "markdown",
    byteSize: 6593,
    chunkCount: 12,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    selected: true,
  },
  {
    id: "src-vector-storage",
    name: "sqlite_vec_specifications.pdf",
    fileType: "pdf",
    byteSize: 2450000,
    chunkCount: 38,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    selected: true,
  },
];

let mockConfig: LlmConfig = {
  provider: "ollama",
  endpointUrl: "http://localhost:11434",
  modelName: "llama3.2:latest",
  temperature: 0.2,
};

export const ApiBridge = {
  isTauri(): boolean {
    return isTauriEnvironment();
  },

  async getSources(): Promise<SourceDocument[]> {
    if (!isTauriEnvironment()) {
      return [...mockSources];
    }
    return invoke<SourceDocument[]>("get_sources");
  },

  async toggleSourceSelection(sourceId: string, selected: boolean): Promise<void> {
    if (!isTauriEnvironment()) {
      mockSources = mockSources.map((s) => (s.id === sourceId ? { ...s, selected } : s));
      return;
    }
    return invoke<void>("toggle_source_selection", { sourceId, selected });
  },

  async deleteSource(sourceId: string): Promise<boolean> {
    if (!isTauriEnvironment()) {
      mockSources = mockSources.filter((s) => s.id !== sourceId);
      return true;
    }
    return invoke<boolean>("delete_source", { sourceId });
  },

  async ingestDocument(fileName: string, fileType: "pdf" | "markdown" | "txt", byteSize: number): Promise<IngestResponse> {
    if (!isTauriEnvironment()) {
      await new Promise((r) => setTimeout(r, 600)); // Simulate chunking & embedding latency
      const newSource: SourceDocument = {
        id: `src-${Date.now()}`,
        name: fileName,
        fileType,
        byteSize,
        chunkCount: Math.max(1, Math.floor(byteSize / 512)),
        uploadedAt: new Date().toISOString(),
        selected: true,
      };
      mockSources.push(newSource);
      return { success: true, source: newSource };
    }
    return invoke<IngestResponse>("ingest_document", { fileName, fileType, byteSize });
  },

  async queryRag(request: QueryRagRequest): Promise<ChatMessage> {
    if (!isTauriEnvironment()) {
      await new Promise((r) => setTimeout(r, 800)); // Simulate inference latency
      const activeSources = mockSources.filter((s) => request.selectedSourceIds.includes(s.id));
      const primarySource = activeSources[0] || mockSources[0];

      const citations: CitationRef[] = [
        {
          citationIndex: 1,
          sourceId: primarySource?.id ?? "src-mock",
          sourceName: primarySource?.name ?? "ARCHITECTURE_AND_ROADMAP.md",
          pageNumber: 1,
          snippet:
            "Gemcraft คือ Desktop Application (สร้างด้วย Tauri 2.0 + Rust + React) ที่โฟกัสการทำ Source-Grounded RAG เลียนแบบแกนหลักของ NotebookLM โดยเน้นความปลอดภัยและความเป็นส่วนตัวแบบ Local-first",
          relevanceScore: 0.94,
        },
        {
          citationIndex: 2,
          sourceId: activeSources[1]?.id ?? primarySource?.id ?? "src-mock",
          sourceName: activeSources[1]?.name ?? primarySource?.name ?? "ARCHITECTURE_AND_ROADMAP.md",
          pageNumber: 2,
          snippet:
            "Local Embeddings ขับเคลื่อนด้วย fastembed-rs (รันโมเดลอย่าง BGE-small / All-MiniLM-L6-v2 ด้วย ONNX Runtime) และ Vector Storage แบบ SQLite-vec ฝังตัวในเครื่อง",
          relevanceScore: 0.88,
        },
      ];

      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `จากการประมวลผลเอกสารอ้างอิง ระบบยืนยันว่าโปรเจกต์ Gemcraft ขับเคลื่อนด้วย Tauri 2.0 ร่วมกับ Rust Backend [^1] และมีสถาปัตยกรรม Local Vector Store ที่ใช้ fastembed-rs กับ SQLite-vec เพื่อให้ผู้ใช้ทำงานแบบ Offline 100% [^2]`,
        citations,
        timestamp: new Date().toISOString(),
      };
    }
    return invoke<ChatMessage>("query_rag", { request });
  },

  async getConfig(): Promise<LlmConfig> {
    if (!isTauriEnvironment()) {
      return { ...mockConfig };
    }
    return invoke<LlmConfig>("get_config");
  },

  async saveConfig(config: LlmConfig): Promise<boolean> {
    if (!isTauriEnvironment()) {
      mockConfig = { ...config };
      return true;
    }
    return invoke<boolean>("save_config", { config });
  },
};
