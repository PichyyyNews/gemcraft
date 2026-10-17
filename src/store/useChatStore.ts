import { create } from "zustand";
import type { ChatMessage, CitationRef } from "../types/ipc";
import { ApiBridge } from "../services/ipc";

interface ChatState {
  messages: ChatMessage[];
  activeCitation: CitationRef | null;
  isGenerating: boolean;
  streamingMessageId: string | null;
  sendMessage: (query: string, selectedSourceIds: string[]) => Promise<void>;
  stopGenerating: () => void;
  setActiveCitation: (citation: CitationRef | null) => void;
  clearMessages: () => void;
}

let activeAbortController: AbortController | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  activeCitation: null,
  isGenerating: false,
  streamingMessageId: null,

  sendMessage: async (query: string, selectedSourceIds: string[]) => {
    if (selectedSourceIds.length === 0) return;

    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      citations: [],
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage, initialAssistantMessage],
      isGenerating: true,
      streamingMessageId: assistantMsgId,
    }));

    try {
      // Step A: Fetch full answer from IPC bridge (or mock engine)
      const fullResponse = await ApiBridge.queryRag({
        query,
        selectedSourceIds,
      });

      if (activeAbortController?.signal.aborted) return;

      // Step B: Token-by-token Typewriter Streaming Simulation
      // Break full text into realistic semantic chunks
      const tokens = fullResponse.content.match(/\S+\s*/g) || [fullResponse.content];
      let currentText = "";

      for (let i = 0; i < tokens.length; i++) {
        if (activeAbortController?.signal.aborted) break;

        currentText += tokens[i];
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: currentText } : m
          ),
        }));

        // Dynamic typing speed: 20-35ms per token
        await new Promise((r) => setTimeout(r, 25));
      }

      if (!activeAbortController?.signal.aborted) {
        // Complete generation: attach citations and set active citation
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: fullResponse.content,
                  citations: fullResponse.citations,
                }
              : m
          ),
          isGenerating: false,
          streamingMessageId: null,
          activeCitation:
            fullResponse.citations && fullResponse.citations.length > 0
              ? fullResponse.citations[0]
              : state.activeCitation,
        }));
      }
    } catch (err) {
      console.error("Failed to query RAG in chat store", err);
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "เกิดข้อผิดพลาดในการประมวลผลคำตอบ กรุณาตรวจสอบการเชื่อมต่อกับโมเดลภาษาในเมนู Settings",
              }
            : m
        ),
        isGenerating: false,
        streamingMessageId: null,
      }));
    } finally {
      activeAbortController = null;
    }
  },

  stopGenerating: () => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    const currentStreamingId = get().streamingMessageId;
    set((state) => ({
      isGenerating: false,
      streamingMessageId: null,
      messages: state.messages.map((m) =>
        m.id === currentStreamingId
          ? {
              ...m,
              content: m.content + " [Generation paused by user]",
            }
          : m
      ),
    }));
  },

  setActiveCitation: (citation: CitationRef | null) => {
    set({ activeCitation: citation });
  },

  clearMessages: () => {
    set({ messages: [], activeCitation: null, isGenerating: false, streamingMessageId: null });
  },
}));
