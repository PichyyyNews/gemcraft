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
    status: "ready",
    progress: 100,
  },
  {
    id: "src-vector-storage",
    name: "sqlite_vec_specifications.pdf",
    fileType: "pdf",
    byteSize: 2450000,
    chunkCount: 38,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    selected: true,
    status: "ready",
    progress: 100,
  },
];

let mockDocumentContents: Record<string, string> = {
  "src-rag-architecture": `# Gemcraft - Architecture & Engineering Roadmap (Reverse-Engineered NotebookLM Desktop)

Gemcraft คือ Desktop Application (สร้างด้วย Tauri 2.0 + Rust + React) ที่โฟกัสการทำ **Source-Grounded RAG** เลียนแบบแกนหลักของ NotebookLM โดยเน้นความปลอดภัย ความเป็นส่วนตัวแบบ Local-first และระบบ Citation ที่แม่นยำสูง

---

## 1. High-Level Architecture Overview

┌────────────────────────────────────────────────────────────────────────┐
│                        Tauri Desktop Frontend                          │
│         (React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui)      │
│                                                                        │
│  ┌──────────────────┐  ┌─────────────────────┐  ┌───────────────────┐  │
│  │  Sources Panel   │  │   Chat & Citation   │  │  Studio & Notes   │  │
│  │ (Upload/Manage)  │  │  (Grounded Answers) │  │  (Saved Snippets) │  │
│  └────────┬─────────┘  └──────────┬──────────┘  └───────────────────┘  │
└───────────┼───────────────────────┼────────────────────────────────────┘
            │ Tauri IPC Commands    │
┌───────────┴───────────────────────┴────────────────────────────────────┐
│                         Tauri Rust Core Backend                        │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ Document Parser       │   │ Vector Store & Indexing              │  │
│  │ - PDF (lopdf/pdf-extract) │ - SQLite-vec / Local Vector DB       │  │
│  │ - Markdown / TXT      │   │ - fastembed-rs (Local ONNX)          │  │
│  │ - Chunking Engine     │   │ - Hybrid Search (BM25 + Dense)       │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Multi-Provider Inference Engine (User Selectable)                │  │
│  │ 1. Local External Engine: Ollama / LM Studio (localhost HTTP)     │  │
│  │ 2. Embedded/Pure Rust: Candle / llama-cpp-rs (Optional/Fallback) │  │
│  │ 3. Cloud Provider: Gemini API / OpenAI / Anthropic (API Keys)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

---

## 2. Key Decisions & Specifications

1. **Core Focus**: ตัดฟีเจอร์ Audio/Podcast และ Slide ออกก่อน เน้นเฉพาะ **Document Ingestion + Strict Grounded RAG + Clickable Source Citations**
2. **Frontend Stack**:
   - React 19 + TypeScript + Vite
   - Tailwind CSS + shadcn/ui + Lucide Icons
   - 3-Column Workspace (Sources List | Central Chat with Citations | Document/Citation Previewer)
3. **Rust Core (Tauri 2.0)**:
   - จัดการ Local Storage, File System, และ Document Chunking
   - **Local Embeddings**: fastembed-rs (รันโมเดลอย่าง BGE-small / All-MiniLM-L6-v2 ด้วย ONNX Runtime แบบไม่ต้องติดตั้ง Python)
   - **Vector Database**: sqlite-vec ฝังตัวอยู่ในเครื่อง
4. **LLM Provider Strategy (All-in-one)**:
   - ผู้ใช้เลือกได้ตามความต้องการใน Settings:
     - **Local Ollama / LM Studio**: ปลอดภัย 100% ออฟไลน์
     - **Cloud API (Gemini / OpenAI / Groq)**: สำหรับผู้ใช้ที่ไม่มี GPU แรงในเครื่อง
     - **Embedded Rust Model**: ซัพพอร์ตผ่าน Candle ในอนาคต
`,
  "src-vector-storage": `# SQLite-vec & FastEmbed Specification Document

## Section 1: In-Process Vector Storage with sqlite-vec
sqlite-vec is an extremely lightweight, zero-dependency SQLite extension written in C that adds vector search capabilities directly into SQLite databases.

Key Highlights:
- Zero external daemons required (runs in-process with the desktop application)
- Native vector data type with cosine distance and L2 distance metrics
- Seamless integration with rusqlite in the Tauri backend
- Highly optimized SIMD operations (AVX-512, AVX2, ARM NEON) for instant vector similarity querying

## Section 2: Local Embeddings Pipeline with fastembed-rs
Fastembed-rs executes quantization-ready embedding models entirely locally using ONNX Runtime.

Supported Models:
- BAAI/bge-small-en-v1.5 (384 dimensions)
- sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
- BAAI/bge-base-en-v1.5 (768 dimensions)

Chunking Configuration:
- Chunk size: 512 tokens with 64 token overlap
- Recursive character splitting preserving sentence boundaries and markdown code fences
- Metadata storage: file name, byte offset, page index, and chunk checksum
`,
};

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

  async getDocumentContent(sourceId: string): Promise<string> {
    if (isTauriEnvironment()) {
      try {
        return await invoke<string>("get_document_content", { sourceId });
      } catch {
        // Fallback to mock text while backend command is under development
      }
    }
    if (mockDocumentContents[sourceId]) {
      return mockDocumentContents[sourceId];
    }
    const source = mockSources.find((s) => s.id === sourceId);
    return `# Document: ${source?.name || "Uploaded Source"}

This document is indexed in Gemcraft Local Vector Store.
Total Chunks: ${source?.chunkCount || 1}
File Size: ${source?.byteSize || 1024} bytes

## Section 1: Introduction
This local document was ingested and vectorized using fastembed-rs. All text segments are available for grounded RAG queries with citation verification.

## Section 2: Grounded Citations
Whenever questions are asked about this document, relevant chunks are extracted through SQLite-vec similarity search.`;
  },
};
