import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Quote } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useSourceStore } from "../../store/useSourceStore";
import type { ChatMessage, CitationRef } from "../../types/ipc";

export const ChatPanel: React.FC = () => {
  const { messages, isGenerating, sendMessage, setActiveCitation } = useChatStore();
  const { sources, setActiveDocument } = useSourceStore();
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const selectedSources = sources.filter((s) => s.selected);
  const selectedCount = selectedSources.length;
  const selectedSourceIds = selectedSources.map((s) => s.id);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
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

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.role === "user") {
      return <p className="text-sm text-slate-100 whitespace-pre-wrap">{msg.content}</p>;
    }

    const parts = msg.content.split(/(\[\^[0-9]+\])/g);

    return (
      <div className="text-sm text-slate-200 leading-relaxed space-y-2">
        <p className="whitespace-pre-wrap">
          {parts.map((part, index) => {
            const match = part.match(/\[\^([0-9]+)\]/);
            if (match) {
              const citationIndex = parseInt(match[1], 10);
              const citation = msg.citations?.find((c) => c.citationIndex === citationIndex);

              return (
                <button
                  key={index}
                  onClick={() => citation && handleSelectCitation(citation)}
                  className="inline-flex items-center justify-center mx-1 px-1.5 py-0.2 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 hover:bg-cyan-900 hover:text-cyan-200 hover:border-cyan-500 transition-all cursor-pointer shadow-sm"
                  title={citation ? `Source: ${citation.sourceName}` : `Citation ${citationIndex}`}
                >
                  <Quote className="w-2.5 h-2.5 mr-0.5 inline" />
                  {citationIndex}
                </button>
              );
            }
            return part;
          })}
        </p>

        {msg.citations && msg.citations.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Sources cited:
            </span>
            {msg.citations.map((c) => (
              <button
                key={c.citationIndex}
                onClick={() => handleSelectCitation(c)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-600 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <span className="font-mono text-cyan-400 font-bold">[{c.citationIndex}]</span>
                <span className="truncate max-w-[150px]">{c.sourceName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const samplePrompts = [
    "สรุปแนวคิดของ Gemcraft และสถาปัตยกรรมหลัก",
    "Vector Store ในเครื่องใช้เทคโนโลยีอะไรและทำงานอย่างไร?",
    "มีตัวเลือก LLM Provider ใดบ้างที่ผู้ใช้เลือกได้?",
  ];

  return (
    <main className="flex-1 h-full flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Top Context Indicator */}
      <div className="px-4 py-2 border-b border-slate-900 bg-slate-950/90 text-xs flex items-center justify-between text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            Grounded against{" "}
            <strong className="text-slate-200">{selectedCount} selected source(s)</strong>
          </span>
        </div>
        {selectedCount === 0 && (
          <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Please select at least 1 source to ground answers</span>
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center mb-4 shadow-lg shadow-cyan-950/40">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Local NotebookLM Workspace</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              ถามคำถามเกี่ยวกับเอกสารในคลังความรู้ของคุณ คำตอบจะถูกอ้างอิงจาก Vector Store
              พร้อมระบบตรวจสอบความถูกต้องแบบคลิกดูหลักฐานได้ทันที
            </p>

            <div className="w-full mt-6 grid grid-cols-1 gap-2 text-left">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt, selectedSourceIds)}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-700/60 transition-all text-xs text-slate-300 hover:text-slate-100 cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <span>{prompt}</span>
                  <Send className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}

              <div
                className={`rounded-2xl p-3.5 shadow-md ${
                  msg.role === "user"
                    ? "bg-cyan-600 text-white rounded-tr-none ml-12"
                    : "bg-slate-900/90 border border-slate-800 rounded-tl-none mr-12"
                }`}
              >
                {renderMessageContent(msg)}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex gap-3 max-w-3xl mr-auto justify-start animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="rounded-2xl rounded-tl-none p-3.5 bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-mono">ค้นหา Vector Index และประมวลผลคำตอบ...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCount === 0
                ? "เลือกเอกสารอย่างน้อย 1 รายการเพื่อเริ่มถาม..."
                : "ถามคำถามเกี่ยวกับเอกสารที่เลือก... (กด Enter เพื่อส่ง)"
            }
            rows={1}
            disabled={selectedCount === 0 || isGenerating}
            className="w-full pl-3.5 pr-12 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-slate-200 placeholder:text-slate-500 resize-none disabled:opacity-50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating || selectedCount === 0}
            className="absolute right-2 p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 disabled:hover:bg-cyan-600 transition-all cursor-pointer shadow-sm shadow-cyan-600/30"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
};
