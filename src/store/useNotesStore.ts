import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CitationRef } from "../types/ipc";

export interface StudioNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  citations?: CitationRef[];
  sourceMessageId?: string;
}

interface NotesState {
  notes: StudioNote[];
  activeEditingNote: StudioNote | null;
  createNote: (title: string, content: string, citations?: CitationRef[], sourceMessageId?: string) => string;
  updateNote: (id: string, updates: Partial<Pick<StudioNote, "title" | "content">>) => void;
  deleteNote: (id: string) => void;
  setActiveEditingNote: (note: StudioNote | null) => void;
  exportAllNotesAsMarkdown: () => string;
}

const initialMockNotes: StudioNote[] = [
  {
    id: "note-init-1",
    title: "Gemcraft RAG Architecture Summary",
    content: "ระบบ Gemcraft ขับเคลื่อนด้วย Tauri 2.0 และ Rust Core โดยใช้ SQLite-vec และ fastembed-rs ในการคำนวณและเก็บ Local Embeddings แบบ 100% Offline",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    citations: [
      {
        citationIndex: 1,
        sourceId: "src-rag-architecture",
        sourceName: "ARCHITECTURE_AND_ROADMAP.md",
        snippet: "Gemcraft คือ Desktop Application (สร้างด้วย Tauri 2.0 + Rust + React) ที่โฟกัสการทำ Source-Grounded RAG",
      },
    ],
  },
];

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: initialMockNotes,
      activeEditingNote: null,

      createNote: (title, content, citations, sourceMessageId) => {
        const id = `note-${Date.now()}`;
        const newNote: StudioNote = {
          id,
          title: title.trim() || "Untitled Note",
          content: content.trim(),
          createdAt: new Date().toISOString(),
          citations: citations || [],
          sourceMessageId,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));

        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : note
          ),
          activeEditingNote:
            state.activeEditingNote?.id === id
              ? {
                  ...state.activeEditingNote,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : state.activeEditingNote,
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          activeEditingNote: state.activeEditingNote?.id === id ? null : state.activeEditingNote,
        }));
      },

      setActiveEditingNote: (note) => {
        set({ activeEditingNote: note });
      },

      exportAllNotesAsMarkdown: () => {
        const { notes } = get();
        if (notes.length === 0) return "# Gemcraft Studio Notes\n\nNo notes available.";

        const header = `# Gemcraft Studio Notes\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
        const body = notes
          .map((n, idx) => {
            const dateStr = new Date(n.createdAt).toLocaleDateString();
            const citationsStr =
              n.citations && n.citations.length > 0
                ? `\n\n**Citations:**\n${n.citations
                    .map((c) => `- [^${c.citationIndex}] ${c.sourceName}: "${c.snippet.slice(0, 80)}..."`)
                    .join("\n")}`
                : "";

            return `## ${idx + 1}. ${n.title}\n*Created: ${dateStr}*\n\n${n.content}${citationsStr}`;
          })
          .join("\n\n---\n\n");

        return header + body;
      },
    }),
    {
      name: "gemcraft-studio-notes",
    }
  )
);
