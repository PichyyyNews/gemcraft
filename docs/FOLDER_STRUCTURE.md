# Gemcraft Project Structure Design

เอกสารนี้ระบุรายละเอียดโครงสร้างโฟลเดอร์ (Folder Structure) และหน้าที่ของแต่ละโมดูลในโปรเจกต์ Gemcraft ครอบคลุมทั้งฝั่ง Frontend (React), Backend (Tauri / Rust), และส่วนประกอบของ RAG Engine เพื่อให้ทีมและ Contributor ทุกคนทำงานตามแนวทางเดียวกัน

---

## 1. Directory Tree Overview

```text
gemcraft/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Multi-platform CI (Win, Mac, Linux: lint + build + cargo check)
│       └── release.yml            # Multi-platform Release builder (.msi, .dmg, .AppImage)
├── docs/                          # เอกสารสถาปัตยกรรมและคู่มือการพัฒนา
│   ├── ARCHITECTURE_AND_ROADMAP.md# สถาปัตยกรรมระบบและ Roadmap หลัก
│   └── FOLDER_STRUCTURE.md        # รายละเอียดโครงสร้างโฟลเดอร์นี้
├── public/                        # Static assets สำหรับ Frontend
├── src/                           # Frontend Source Code (React 19 + TypeScript + Vite)
│   ├── assets/                    # รูปภาพ, SVG, โลโก้ และ static media ภายในแอป
│   ├── components/                # Reusable UI Components
│   │   ├── common/                # UI พื้นฐาน เช่น Button, Modal, Tooltip, Input (shadcn)
│   │   ├── layout/                # โครงสร้างหน้าจอหลัก (Header, Sidebar, 3-Column Splitter)
│   │   ├── sources/               # โมดูลจัดการเอกสาร (SourceList, UploadZone, SourceItem)
│   │   ├── chat/                  # กล่องแชต (MessageList, ChatInput, CitationBadge, StreamingBubble)
│   │   ├── viewer/                # ตัวพรีวิวเอกสารต้นฉบับและการไฮไลต์ (PDFViewer, MarkdownViewer)
│   │   └── settings/              # หน้าต่างตั้งค่า LLM Providers (Ollama, Gemini, OpenAI)
│   ├── hooks/                     # Custom React Hooks
│   │   ├── useTauriCommand.ts     # Wrapper เรียก Tauri IPC Commands
│   │   ├── useSources.ts          # จัดการ state และการอัปโหลดเอกสาร
│   │   ├── useChat.ts             # จัดการประวัติการคุยและการ Stream ข้อความ
│   │   └── useSettings.ts         # บันทึกและดึงค่า Configuration ของ LLM
│   ├── services/                  # การคุยกับ Tauri Backend ผ่าน IPC
│   │   ├── tauriApi.ts            # รวม interface Tauri Invoke
│   │   ├── sourcesApi.ts          # คำสั่งจัดการไฟล์/Ingestion
│   │   └── ragApi.ts              # คำสั่ง Query/Inference
│   ├── store/                     # State Management (Zustand หรือ Context)
│   │   ├── useSourceStore.ts      # เก็บรายการไฟล์ที่ถูก ingest แล้วใน Notebook ปัจจุบัน
│   │   └── useChatStore.ts        # เก็บข้อความ, สถานะ citation active
│   ├── types/                     # TypeScript Interfaces & Types
│   │   ├── source.d.ts            # Type สำหรับ Source, Chunk, Metadata
│   │   ├── chat.d.ts              # Type สำหรับ Message, Citation, Reference
│   │   └── settings.d.ts          # Type สำหรับ Provider Configs
│   ├── utils/                     # Utility Functions (Text parsing, formatting, helpers)
│   ├── App.css                    # Global CSS & Tailwind Directives
│   ├── App.tsx                    # Root Container แบ่งหน้าจอ 3-Column Workspace
│   └── main.tsx                   # React Entrypoint
├── src-tauri/                     # Tauri Core & Rust Backend
│   ├── capabilities/              # Tauri 2.0 Security Capabilities
│   │   └── default.json           # สิทธิ์การเข้าถึง Filesystem, Dialog, Shell
│   ├── icons/                     # Application Icons (ico, icns, png สำหรับ OS ต่างๆ)
│   ├── src/                       # Rust Source Code
│   │   ├── commands/              # Tauri Commands (Exposed ไปยัง Frontend)
│   │   │   ├── mod.rs
│   │   │   ├── document.rs        # คำสั่ง ingest, parse, list sources
│   │   │   ├── rag.rs             # คำสั่ง retrieve context, query, stream response
│   │   │   └── settings.rs        # คำสั่ง save/load settings
│   │   ├── engine/                # แกนประมวลผล RAG (Core Logic)
│   │   │   ├── mod.rs
│   │   │   ├── parser.rs          # ตัวแยกข้อความ (PDF via lopdf, Markdown, Plain Text)
│   │   │   ├── chunker.rs         # Semantic & Recursive Chunking พร้อมระบุ page และ offsets
│   │   │   ├── embedder.rs        # Local Embedding Engine (fastembed-rs / ONNX)
│   │   │   └── vector_store.rs    # Vector Database Interface (sqlite-vec / SQLite)
│   │   ├── providers/             # LLM Provider Adapters
│   │   │   ├── mod.rs
│   │   │   ├── ollama.rs          # คุยกับ Ollama (localhost:11434)
│   │   │   ├── cloud.rs           # คุยกับ Gemini API / OpenAI API
│   │   │   └── traits.rs          # Trait มาตรฐานสำหรับ LLM Provider ทุกตัว
│   │   ├── lib.rs                 # Tauri Plugin Setup & Command Registration
│   │   └── main.rs                # Desktop Application Binary Entrypoint
│   ├── Cargo.toml                 # Rust Dependencies & Build Config
│   ├── build.rs                   # Tauri Build Script
│   └── tauri.conf.json            # การตั้งค่าแอปพลิเคชัน Tauri 2.0
├── package.json                   # NPM Dependencies & Scripts
├── tsconfig.json                  # TypeScript Compiler Options
├── vite.config.ts                 # Vite Configuration
└── README.md                      # Overview และขั้นตอนเริ่มต้นพัฒนา
```

---

## 2. Core Module Breakdown

### 2.1 Frontend Architecture (`src/`)
- **3-Column Layout Pattern**:
  - **Left**: `components/sources/` จัดการ Source Documents (อัปโหลด, เลือกว่าจะให้อ้างอิงเล่มไหนบ้าง)
  - **Center**: `components/chat/` แชตตอบคำถามพร้อม Citation Tags `[^1]`
  - **Right**: `components/viewer/` ไฮไลต์ข้อความในเอกสารจริงเมื่อคลิก Citation
- **IPC Layer**:
  - รวมศูนย์การเรียก Invoke ฝั่ง Rust ไว้ที่ `services/` เพื่อให้สามารถ Mock สำหรับทดสอบบน Web Browser ทั่วไปได้ง่าย

### 2.2 Rust Backend Architecture (`src-tauri/src/`)
- **`commands/`**: ทำหน้าที่เป็น Gateway รับ Request จาก Frontend และตอบกลับ (บางคำสั่งรองรับ Channel เพื่อ Stream ข้อความแบบ Real-time)
- **`engine/`**: 
  - `parser.rs` อ่านข้อมูลดิบจากไฟล์ของผู้ใช้
  - `chunker.rs` หั่นข้อความเป็นท่อนขนาดพอเหมาะ (เช่น 512 tokens + overlap 64) พร้อมจดจำพิกัด `page` และ `char_span`
  - `embedder.rs` ใช้ `fastembed-rs` รันโมเดล `bge-small-en-v1.5` หรือ `all-minilm-l6-v2` แบบ in-process
  - `vector_store.rs` บันทึก Embedding ลงใน SQLite พร้อม sqlite-vec extension เพื่อค้นหาแบบ Similarity Search
- **`providers/`**:
  - Abstraction layer สำหรับโมเดลภาษา รองรับทั้ง Local (Ollama) และ Cloud (Gemini / OpenAI) โดยส่ง Context ที่ค้นพบพร้อม Grounded Prompt ("Strictly answer using only the provided sources and cite references")
