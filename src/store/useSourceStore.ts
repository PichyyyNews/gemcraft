import { create } from "zustand";
import type { SourceDocument, SupportedFileType } from "../types/ipc";
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
}

export const useSourceStore = create<SourceState>((set) => ({
  sources: [],
  activeDocument: null,
  isLoading: false,

  fetchSources: async () => {
    set({ isLoading: true });
    try {
      const sources = await ApiBridge.getSources();
      set({ sources, isLoading: false });
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

  addSource: async (fileName: string, fileType: SupportedFileType, byteSize: number) => {
    set({ isLoading: true });
    try {
      const res = await ApiBridge.ingestDocument(fileName, fileType, byteSize);
      if (res.success && res.source) {
        set((state) => ({
          sources: [res.source!, ...state.sources],
          activeDocument: res.source,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error("Failed to ingest document in store", err);
      set({ isLoading: false });
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
