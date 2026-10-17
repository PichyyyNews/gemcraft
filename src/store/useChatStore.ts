import { create } from "zustand";
import type { ChatMessage, CitationRef } from "../types/ipc";
import { ApiBridge } from "../services/ipc";

interface ChatState {
  messages: ChatMessage[];
  activeCitation: CitationRef | null;
  isGenerating: boolean;
  sendMessage: (query: string, selectedSourceIds: string[]) => Promise<void>;
  setActiveCitation: (citation: CitationRef | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeCitation: null,
  isGenerating: false,

  sendMessage: async (query: string, selectedSourceIds: string[]) => {
    if (selectedSourceIds.length === 0) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isGenerating: true,
    }));

    try {
      const assistantMessage = await ApiBridge.queryRag({
        query,
        selectedSourceIds,
      });

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isGenerating: false,
        activeCitation:
          assistantMessage.citations && assistantMessage.citations.length > 0
            ? assistantMessage.citations[0]
            : state.activeCitation,
      }));
    } catch (err) {
      console.error("Failed to query RAG in chat store", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "เกิดข้อผิดพลาดในการประมวลผลคำตอบ กรุณาลองใหม่อีกครั้ง",
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isGenerating: false,
      }));
    }
  },

  setActiveCitation: (citation: CitationRef | null) => {
    set({ activeCitation: citation });
  },

  clearMessages: () => {
    set({ messages: [], activeCitation: null });
  },
}));
