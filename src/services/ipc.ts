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

// Initial in-memory mock repository for testing before backend implementation
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
    if (isTauriEnvironment()) {
      try {
        return await invoke<SourceDocument[]>("get_sources");
      } catch {
        // Fallback to mock data while backend command is under development
      }
    }
    return [...mockSources];
  },

  async toggleSourceSelection(sourceId: string, selected: boolean): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await invoke<void>("toggle_source_selection", { sourceId, selected });
        return;
      } catch {
        // Fallback to mock data while backend command is under development
      }
    }
    mockSources = mockSources.map((s) => (s.id === sourceId ? { ...s, selected } : s));
  },

  async deleteSource(sourceId: string): Promise<boolean> {
    if (isTauriEnvironment()) {
      try {
        return await invoke<boolean>("delete_source", { sourceId });
      } catch {
        // Fallback to mock data while backend command is under development
      }
    }
    mockSources = mockSources.filter((s) => s.id !== sourceId);
    return true;
  },

  async ingestDocument(
    fileName: string,
    fileType: "pdf" | "markdown" | "txt",
    byteSize: number
  ): Promise<IngestResponse> {
    if (isTauriEnvironment()) {
      try {
        return await invoke<IngestResponse>("ingest_document", { fileName, fileType, byteSize });
      } catch {
        // Fallback to mock simulation while backend command is under development
      }
    }

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
  },

  async queryRag(request: QueryRagRequest): Promise<ChatMessage> {
    if (isTauriEnvironment()) {
      try {
        return await invoke<ChatMessage>("query_rag", { request });
      } catch {
        // Fallback to mock generation while backend command is under development
      }
    }

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
  },

  async getConfig(): Promise<LlmConfig> {
    if (isTauriEnvironment()) {
      try {
        return await invoke<LlmConfig>("get_config");
      } catch {
        // Fallback to mock config while backend command is under development
      }
    }
    return { ...mockConfig };
  },

  async saveConfig(config: LlmConfig): Promise<boolean> {
    if (isTauriEnvironment()) {
      try {
        return await invoke<boolean>("save_config", { config });
      } catch {
        // Fallback to mock storage while backend command is under development
      }
    }
    mockConfig = { ...config };
    return true;
  },
};
