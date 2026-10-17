import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Square,
  Sparkles,
  Copy,
  Check,
  Layers,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useSourceStore } from "../../store/useSourceStore";
import { useNotesStore } from "../../store/useNotesStore";
import { MarkdownContent } from "./MarkdownContent";
import type { CitationRef } from "../../types/ipc";

export const ChatPanel: React.FC = () => {
  const {
    messages,
    isGenerating,
    streamingMessageId,
    sendMessage,
    stopGenerating,
    setActiveCitation,
    activeCitation,
  } = useChatStore();
  const { sources, setActiveDocument } = useSourceStore();
  const { createNote, notes } = useNotesStore();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const selectedSources = sources.filter((s) => s.selected);
  const selectedCount = selectedSources.length;
  const selectedSourceIds = selectedSources.map((s) => s.id);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating || selectedCount === 0) return;
    sendMessage(input.trim(), selectedSourceIds);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSelectCitation = (citation: CitationRef) => {
    setActiveCitation(citation);
    setActiveDocument(null);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handlePinMessage = (msgId: string, content: string, citations?: CitationRef[]) => {
    const firstLine = content.split("\n")[0].replace(/^#+\s*/, "").slice(0, 48);
    const title = firstLine || "Grounded Note";
    createNote(title, content, citations, msgId);
    setPinnedId(msgId);
    setTimeout(() => setPinnedId(null), 2000);
  };

  const starterCards = [
    { title: "Study Guide", desc: "สรุปประเด็นหลักและคำสำคัญของเอกสารนี้" },
    { title: "Briefing Doc", desc: "สรุปสถาปัตยกรรมระบบและฟังก์ชันสำคัญ" },
    { title: "FAQ", desc: "คำถามที่พบบ่อยเกี่ยวกับระบบ RAG และ Vector Store" },
  ];

  return (
    <main className="flex-1 h-full flex flex-col bg-[#131314] relative overflow-hidden text-[#e3e3e3]">
      {/* Scrollable Conversation View */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#28292c] border border-[#444746] flex items-center justify-center text-[#c5bfff] mb-4 shadow-md">
              <Sparkles className="w-6 h-6 text-[#c5bfff]" />
            </div>

            <h1 className="text-2xl font-normal text-[#e3e3e3] tracking-tight">Gemcraft Studio</h1>
            <p className="text-xs text-[#8e918f] mt-1.5 max-w-md leading-relaxed font-sans">
              Ground your queries in {selectedCount} active source{selectedCount !== 1 ? "s" : ""}.
              Answers are strictly verified against local embeddings.
            </p>

            {/* Quick Starter Cards */}
            <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              {starterCards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(card.desc, selectedSourceIds)}
                  className="p-3.5 rounded-2xl border border-[#282a2e] bg-[#1e1f20]/60 hover:bg-[#1e1f20] hover:border-[#444746] transition-all text-left cursor-pointer group shadow-sm"
                >
                  <div className="text-xs font-medium text-[#e3e3e3] group-hover:text-[#a8c7fa] transition-colors">
                    {card.title}
                  </div>
                  <div className="text-[11px] text-[#8e918f] mt-1 leading-snug">
                    {card.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isThisStreaming = streamingMessageId === msg.id && isGenerating;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#2b2938] border border-[#484461]/60 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5bfff]" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 shadow-sm w-full ${
                    msg.role === "user"
                      ? "bg-[#28292c] border border-[#444746] text-white rounded-br-none ml-12 max-w-lg"
                      : "bg-[#1e1f20] border border-[#282a2e] text-[#e3e3e3] rounded-bl-none mr-8"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-xs text-[#e3e3e3] leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Markdown Body */}
                      <MarkdownContent
                        content={msg.content}
                        citations={msg.citations}
                        activeCitation={activeCitation}
                        onSelectCitation={handleSelectCitation}
                        isStreaming={isThisStreaming}
                      />

                      {/* Footer Actions (Copy & Citations count) */}
                      {!isThisStreaming && msg.content && (
                        <div className="pt-2 flex items-center justify-between border-t border-[#282a2e]/60">
                          <div className="flex items-center gap-1.5">
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-[#8e918f]">
                                <Layers className="w-3 h-3 text-[#a8c7fa]" />
                                <span>{msg.citations.length} source citation(s)</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handlePinMessage(msg.id, msg.content, msg.citations)}
                              className="p-1.5 rounded-full hover:bg-[#28292c] text-[#8e918f] hover:text-[#e3e3e3] transition-colors cursor-pointer"
                              title="Save to Studio Notes"
                            >
                              {pinnedId === msg.id || notes.some((n) => n.sourceMessageId === msg.id) ? (
                                <BookmarkCheck className="w-3.5 h-3.5 text-[#a8c7fa]" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="p-1.5 rounded-full hover:bg-[#28292c] text-[#8e918f] hover:text-[#e3e3e3] transition-colors cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-[#7ada94]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* NotebookLM Signature Floating Pill Input Bar */}
      <div className="p-4 shrink-0 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-[#1e1f20] border border-[#444746] focus-within:border-[#a8c7fa] shadow-lg transition-all"
          >
            {/* Sources Chip Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131314] text-[11px] text-[#c4c7c5] shrink-0 font-medium">
              <Layers className="w-3 h-3 text-[#a8c7fa]" />
              <span>
                {selectedCount} source{selectedCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Input textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedCount === 0
                  ? "Select at least 1 source to ask questions..."
                  : isGenerating
                  ? "Generating response..."
                  : "Ask anything about your sources..."
              }
              rows={1}
              disabled={selectedCount === 0 || isGenerating}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder:text-[#8e918f] focus:outline-none resize-none leading-normal font-sans disabled:opacity-50"
            />

            {/* Stop or Submit Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGenerating}
                className="w-8 h-8 rounded-full bg-[#f28b82] hover:bg-[#f6aea9] text-[#041e49] flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md"
                title="Stop Generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || selectedCount === 0}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  input.trim() && selectedCount > 0
                    ? "bg-[#a8c7fa] text-[#041e49] hover:bg-[#d3e3fd] shadow-md shadow-[#a8c7fa]/20"
                    : "bg-[#28292c] text-[#8e918f] opacity-50 cursor-not-allowed"
                }`}
                title="Submit Query"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};
