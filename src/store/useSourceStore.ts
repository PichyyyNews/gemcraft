import { create } from "zustand";
import type { SourceDocument, SupportedFileType, IngestionStatus } from "../types/ipc";
import { ApiBridge } from "../services/ipc";

interface SourceState {
  sources: SourceDocument[];
  activeDocument: SourceDocument | null;
  isLoading: boolean;
  fetchSources: () => Promise<void>;
  toggleSource: (id: string, selected: boolean) => Promise<void>;
  addSource: (fileName: string, fileType: SupportedFileType, byteSize: number) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  setActiveDocument: (doc: SourceDocument | null) => void;
  updateSourceStatus: (id: string, status: IngestionStatus, progress: number) => void;
}

export const useSourceStore = create<SourceState>((set) => ({
  sources: [],
  activeDocument: null,
  isLoading: false,

  fetchSources: async () => {
    set({ isLoading: true });
    try {
      const sources = await ApiBridge.getSources();
      // Ensure all initial sources have ready status
      const normalizedSources = sources.map((s) => ({
        ...s,
        status: s.status || "ready",
        progress: s.progress || 100,
      }));
      set({ sources: normalizedSources, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch sources in store", err);
      set({ isLoading: false });
    }
  },

  toggleSource: async (id: string, selected: boolean) => {
    set((state) => ({
      sources: state.sources.map((s) => (s.id === id ? { ...s, selected } : s)),
    }));
    try {
      await ApiBridge.toggleSourceSelection(id, selected);
    } catch (err) {
      console.error("Failed to toggle source selection in store", err);
    }
  },

  updateSourceStatus: (id: string, status: IngestionStatus, progress: number) => {
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, status, progress } : s
      ),
    }));
  },

  addSource: async (fileName: string, fileType: SupportedFileType, byteSize: number) => {
    const tempId = `src-${Date.now()}`;
    const initialDoc: SourceDocument = {
      id: tempId,
      name: fileName,
      fileType,
      byteSize,
      chunkCount: Math.max(1, Math.floor(byteSize / 512)),
      uploadedAt: new Date().toISOString(),
      selected: true,
      status: "uploading",
      progress: 25,
    };

    // Prepend to state immediately for instant feedback
    set((state) => ({
      sources: [initialDoc, ...state.sources],
      activeDocument: initialDoc,
    }));

    // Stage 1: Uploading (25%) -> Stage 2: Chunking (60%)
    await new Promise((r) => setTimeout(r, 350));
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === tempId ? { ...s, status: "chunking", progress: 60 } : s
      ),
    }));

    // Stage 2: Chunking (60%) -> Stage 3: Embedding (85%)
    await new Promise((r) => setTimeout(r, 400));
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === tempId ? { ...s, status: "embedding", progress: 85 } : s
      ),
    }));

    try {
      const res = await ApiBridge.ingestDocument(fileName, fileType, byteSize);
      if (res.success && res.source) {
        const readyDoc: SourceDocument = {
          ...res.source,
          status: "ready",
          progress: 100,
        };
        set((state) => ({
          sources: state.sources.map((s) =>
            s.id === tempId ? readyDoc : s
          ),
          activeDocument: readyDoc,
        }));
      } else {
        set((state) => ({
          sources: state.sources.map((s) =>
            s.id === tempId ? { ...s, status: "error" } : s
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to ingest document in store", err);
      set((state) => ({
        sources: state.sources.map((s) =>
          s.id === tempId ? { ...s, status: "error" } : s
        ),
      }));
    }
  },

  deleteSource: async (id: string) => {
    try {
      const success = await ApiBridge.deleteSource(id);
      if (success) {
        set((state) => ({
          sources: state.sources.filter((s) => s.id !== id),
          activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
        }));
      }
    } catch (err) {
      console.error("Failed to delete source in store", err);
    }
  },

  setActiveDocument: (doc: SourceDocument | null) => {
    set({ activeDocument: doc });
  },
}));
