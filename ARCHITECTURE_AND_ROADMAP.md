# Gemcraft - Architecture & Engineering Roadmap (Reverse-Engineered NotebookLM Desktop)

Gemcraft คือ Desktop Application (สร้างด้วย Tauri 2.0 + Rust + React) ที่โฟกัสการทำ **Source-Grounded RAG** เลียนแบบแกนหลักของ NotebookLM โดยเน้นความปลอดภัย ความเป็นส่วนตัวแบบ Local-first และระบบ Citation ที่แม่นยำสูง

---

## 1. High-Level Architecture Overview

```
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
```

---

## 2. Key Decisions & Specifications

1. **Core Focus**: ตัดฟีเจอร์ Audio/Podcast และ Slide ออกก่อน เน้นเฉพาะ **Document Ingestion + Strict Grounded RAG + Clickable Source Citations**
2. **Frontend Stack**:
   - React 19 + TypeScript + Vite
   - Tailwind CSS + shadcn/ui + Lucide Icons
   - 3-Column Workspace (Sources List | Central Chat with Citations | Document/Citation Previewer)
3. **Rust Core (Tauri 2.0)**:
   - จัดการ Local Storage, File System, และ Document Chunking
   - **Local Embeddings**: `fastembed-rs` (รันโมเดลอย่าง BGE-small / All-MiniLM-L6-v2 ด้วย ONNX Runtime แบบไม่ต้องติดตั้ง Python)
   - **Vector Database**: `sqlite-vec` ฝังตัวอยู่ในเครื่อง
4. **LLM Provider Strategy (All-in-one)**:
   - ผู้ใช้เลือกได้ตามความต้องการใน Settings:
     - **Local Ollama / LM Studio**: ปลอดภัย 100% ออฟไลน์
     - **Cloud API (Gemini / OpenAI / Groq)**: สำหรับผู้ใช้ที่ไม่มี GPU แรงในเครื่อง
     - **Embedded Rust Model**: ซัพพอร์ตผ่าน Candle ในอนาคต

---

## 3. Implementation Roadmap

### Phase 1: Core Setup & Document Ingestion (Current Focus)
- [ ] Initialize Tauri 2.0 project with React 19 + TypeScript + Tailwind CSS
- [ ] Configure Rust backend with SQLite & Vector storage capabilities
- [ ] Implement Document Ingestion Pipeline:
  - File picker (PDF, Markdown, Plain Text)
  - Text extraction and chunking (tracking chunk metadata: `page_number`, `offsets`, `source_id`)
  - Embedding computation with `fastembed-rs`
- [ ] Implement basic Retrieval test (Cosine similarity lookup)

### Phase 2: Multi-Provider LLM & RAG Orchestration
- [ ] Settings configuration UI for LLM provider (Ollama endpoint or Cloud API keys)
- [ ] Grounded Prompt Engineering (Strict "cite your source" format `[^1]`)
- [ ] Streaming response support over Tauri IPC

### Phase 3: NotebookLM-Grade UI & Citation Interaction
- [ ] 3-Column Notebook Workspace
- [ ] Side-by-side Document Viewer: คลิก citation `[^1]` แล้วไฮไลต์ข้อความตรงตำแหน่งใน PDF หรือเอกสารต้นทางทันที
- [ ] Note pinning / Summary generation per document
