import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Copy,
  Check,
  FileText,
  Search,
  ArrowLeft,
  Headphones,
  Play,
  Pause,
  BookOpen,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useSourceStore } from "../../store/useSourceStore";
import { formatBytes } from "../../lib/utils";
import { NotesSection } from "./NotesSection";
import { GemcraftLogo } from "../common/GemcraftLogo";
import type { CitationRef } from "../../types/ipc";

export const CitationInspector: React.FC = () => {
  const { activeCitation, setActiveCitation, sendMessage } = useChatStore();
  const {
    sources,
    activeDocument,
    setActiveDocument,
    documentContents,
    isLoadingContent,
    fetchDocumentContent,
  } = useSourceStore();

  const [activeTab, setActiveTab] = useState<"citation" | "document">("citation");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const citedPassageRef = useRef<HTMLDivElement>(null);

  // When activeCitation arrives, default to "citation" tab and resolve document
  useEffect(() => {
    if (activeCitation) {
      setActiveTab("citation");
      const matchedSource = sources.find((s) => s.id === activeCitation.sourceId);
      if (matchedSource && (!activeDocument || activeDocument.id !== matchedSource.id)) {
        setActiveDocument(matchedSource);
      }
    }
  }, [activeCitation, sources, activeDocument, setActiveDocument]);

  // When activeDocument changes or when switching to "document" tab, load content
  useEffect(() => {
    const targetSourceId = activeDocument?.id || activeCitation?.sourceId;
    if (targetSourceId && !documentContents[targetSourceId]) {
      fetchDocumentContent(targetSourceId);
    }
  }, [activeDocument, activeCitation, documentContents, fetchDocumentContent]);

  // Auto-scroll to cited passage when viewing full document
  useEffect(() => {
    if (activeTab === "document" && activeCitation && citedPassageRef.current) {
      const timer = setTimeout(() => {
        citedPassageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, activeCitation]);

  // Audio overview simulation progress timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleClose = () => {
    setActiveCitation(null);
    setActiveDocument(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  const currentSourceId = activeDocument?.id || activeCitation?.sourceId;
  const currentSourceName =
    activeDocument?.name || activeCitation?.sourceName || "Source Document";
  const rawDocumentContent = currentSourceId ? documentContents[currentSourceId] || "" : "";

  // Render text with search highlighting
  const renderHighlightedContent = (text: string) => {
    if (!docSearchQuery.trim()) {
      return text;
    }
    const query = docSearchQuery.trim();
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-[#fdd663] text-black px-1 rounded-xs font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Check if a line/paragraph contains the cited snippet
  const isPassageMatching = (paragraph: string, citation: CitationRef | null): boolean => {
    if (!citation || !citation.snippet) return false;
    const cleanSnippet = citation.snippet.trim().slice(0, 40).toLowerCase();
    return paragraph.toLowerCase().includes(cleanSnippet);
  };

  const isDocumentOrCitationActive = Boolean(activeCitation || activeDocument);

  return (
    <aside className="w-88 h-full border-l border-[#282a2e] bg-[#1e1f20] flex flex-col shrink-0 animate-in slide-in-from-right duration-150 z-10 text-[#e3e3e3] select-none">
      {/* =========================================================================
          VIEW A: ACTIVE CITATION OR DOCUMENT VIEWER
      ========================================================================= */}
      {isDocumentOrCitationActive ? (
        <>
          {/* Header Navigation */}
          <div className="p-3.5 border-b border-[#282a2e] flex items-center justify-between bg-[#1e1f20]">
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-xs text-[#8e918f] hover:text-[#e3e3e3] transition-colors cursor-pointer group"
              title="Return to Studio Workspace"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Studio</span>
            </button>

            <div className="flex items-center gap-2 max-w-[160px] truncate">
              <FileText className="w-3.5 h-3.5 text-[#a8c7fa] shrink-0" />
              <span className="text-xs font-medium text-[#e3e3e3] truncate">
                {currentSourceName}
              </span>
            </div>

            <button
              onClick={handleClose}
              className="p-1 rounded-full text-[#8e918f] hover:text-white hover:bg-[#28292c] transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dual Tabs: Citation Focus vs Full Document */}
          <div className="flex border-b border-[#282a2e] bg-[#171819] px-2 pt-1 gap-1">
            {activeCitation && (
              <button
                type="button"
                onClick={() => setActiveTab("citation")}
                className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "citation"
                    ? "border-[#a8c7fa] text-[#a8c7fa]"
                    : "border-transparent text-[#8e918f] hover:text-[#c4c7c5]"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#a8c7fa] text-[#041e49] flex items-center justify-center text-[10px] font-mono font-bold">
                  {activeCitation.citationIndex}
                </div>
                <span>Citation Focus</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("document")}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "document" || !activeCitation
                  ? "border-[#a8c7fa] text-[#a8c7fa]"
                  : "border-transparent text-[#8e918f] hover:text-[#c4c7c5]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Document</span>
            </button>
          </div>

          {/* TAB 1: CITATION FOCUS */}
          {activeTab === "citation" && activeCitation && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Badge & Relevance Metric */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#131314] border border-[#282a2e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#a8c7fa] text-[#041e49] flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                    {activeCitation.citationIndex}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Grounded Citation</div>
                    <div className="text-[11px] text-[#8e918f]">
                      Page {activeCitation.pageNumber || 1}
                    </div>
                  </div>
                </div>

                {activeCitation.relevanceScore && (
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-[#7ada94]">
                      {(activeCitation.relevanceScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-[#8e918f]">Vector Cosine</div>
                  </div>
                )}
              </div>

              {/* Source Document Metadata */}
              <div className="p-3 rounded-xl bg-[#131314] border border-[#282a2e] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8e918f]">
                  <span>Source File:</span>
                  <span className="text-[#e3e3e3] font-medium truncate max-w-[170px]">
                    {activeCitation.sourceName}
                  </span>
                </div>
                {activeDocument && (
                  <div className="flex items-center justify-between text-xs text-[#8e918f]">
                    <span>Indexed Size:</span>
                    <span className="text-[#e3e3e3] font-mono">
                      {formatBytes(activeDocument.byteSize)}
                    </span>
                  </div>
                )}
              </div>

              {/* Exact Quoted Passage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#8e918f]">
                  <span className="font-medium tracking-wide">VERIFIED PASSAGE</span>
                  <button
                    onClick={() => handleCopy(activeCitation.snippet)}
                    className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3 h-3 text-[#7ada94]" />
                        <span className="text-[#7ada94]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <blockquote className="p-3.5 rounded-2xl bg-[#131314] border border-[#37393e] text-xs text-[#e3e3e3] leading-relaxed font-sans select-text shadow-inner">
                  "{activeCitation.snippet}"
                </blockquote>
              </div>

              {/* Quick Jump to Full Document */}
              <button
                type="button"
                onClick={() => setActiveTab("document")}
                className="w-full py-2.5 px-3 rounded-xl border border-[#444746] bg-[#28292c]/50 hover:bg-[#28292c] hover:border-[#a8c7fa]/50 text-xs text-[#c4c7c5] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#a8c7fa]" />
                <span>Jump to passage in Full Document</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8e918f]" />
              </button>
            </div>
          )}

          {/* TAB 2: FULL DOCUMENT VIEWER */}
          {(activeTab === "document" || !activeCitation) && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* In-Document Search Bar */}
              <div className="p-2.5 border-b border-[#282a2e] bg-[#171819] flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1e1f20] border border-[#282a2e] focus-within:border-[#a8c7fa] text-xs transition-colors">
                  <Search className="w-3.5 h-3.5 text-[#8e918f] shrink-0" />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Find in document..."
                    className="bg-transparent text-white placeholder:text-[#8e918f] focus:outline-none w-full text-xs"
                  />
                  {docSearchQuery && (
                    <button
                      onClick={() => setDocSearchQuery("")}
                      className="text-[#8e918f] hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Document Text Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs select-text">
                {isLoadingContent ? (
                  <div className="space-y-3 py-6">
                    <div className="h-4 bg-[#28292c] rounded-md animate-pulse w-3/4" />
                    <div className="h-4 bg-[#28292c] rounded-md animate-pulse w-full" />
                    <div className="h-4 bg-[#28292c] rounded-md animate-pulse w-5/6" />
                    <div className="h-4 bg-[#28292c] rounded-md animate-pulse w-2/3" />
                  </div>
                ) : rawDocumentContent ? (
                  rawDocumentContent.split("\n\n").map((para, index) => {
                    const isCited = isPassageMatching(para, activeCitation);

                    if (isCited) {
                      return (
                        <div
                          key={index}
                          ref={citedPassageRef}
                          className="p-3.5 rounded-xl bg-[#a8c7fa]/10 border-l-4 border-[#a8c7fa] ring-1 ring-[#a8c7fa]/20 shadow-md transition-all my-2 space-y-1.5"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#a8c7fa] font-bold">
                            <span className="w-4 h-4 rounded-full bg-[#a8c7fa] text-[#041e49] inline-flex items-center justify-center text-[9px]">
                              {activeCitation?.citationIndex || 1}
                            </span>
                            <span>CITED PASSAGE IN RAG QUERY</span>
                          </div>
                          <p className="text-xs text-[#e3e3e3] leading-relaxed whitespace-pre-wrap">
                            {renderHighlightedContent(para)}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={index}
                        className="text-xs text-[#c4c7c5] leading-relaxed whitespace-pre-wrap py-0.5"
                      >
                        {renderHighlightedContent(para)}
                      </p>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-[#8e918f] space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-[#444746]" />
                    <p>No text content loaded for this document.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="p-3 border-t border-[#282a2e] bg-[#1e1f20] text-[11px] text-[#8e918f] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#a8c7fa]" />
              <span>{activeDocument?.chunkCount || 1} Chunks Indexed</span>
            </span>
            <span className="font-mono text-[10px] text-[#7ada94]">Local-first</span>
          </div>
        </>
      ) : (
        /* =========================================================================
           VIEW B: NOTEBOOKLM STUDIO WORKSPACE (DEFAULT IDLE STATE)
        ========================================================================= */
        <div className="flex-1 flex flex-col overflow-y-auto text-[#e3e3e3]">
          {/* Studio Header */}
          <div className="p-4 border-b border-[#282a2e] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GemcraftLogo className="w-4 h-4 object-contain" alt="Studio" />
              <h3 className="text-sm font-medium text-white">Studio</h3>
            </div>
            <span className="text-[11px] text-[#8e918f] font-mono">NotebookLM</span>
          </div>

          <div className="p-4 space-y-5">
            {/* Audio Overview (Deep Dive) Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2b273d] to-[#1e1f20] border border-[#484461]/50 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#c5bfff]/20 text-[#c5bfff] flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Audio Overview</h4>
                    <span className="text-[10px] text-[#c5bfff] font-medium">Deep Dive Podcast</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-8 h-8 rounded-full bg-[#c5bfff] hover:bg-[#d8d4ff] text-[#041e49] flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title={isPlayingAudio ? "Pause Overview" : "Play Overview"}
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#c4c7c5] leading-relaxed">
                Two AI hosts discuss and unpack the key ideas from your indexed documents.
              </p>

              {/* Audio progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#131314] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#c5bfff] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8e918f] font-mono">
                  <span>{isPlayingAudio ? "02:14" : "00:00"}</span>
                  <span>08:45</span>
                </div>
              </div>
            </div>

            {/* Studio Guided Notebook Tools */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#8e918f] tracking-wide">
                STUDIO GENERATORS
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: "Study Guide", prompt: "สร้าง Study Guide สรุปประเด็นหลักและคำถามสำคัญ" },
                  { title: "Briefing Doc", prompt: "สร้าง Briefing Doc สรุปสาระสำคัญสำหรับผู้บริหาร" },
                  { title: "FAQ", prompt: "สร้างรายการ FAQ คำถามและคำตอบที่พบบ่อยจากเอกสารนี้" },
                  { title: "Timeline", prompt: "สร้างลำดับเหตุการณ์ (Timeline) ตามเนื้อหาในเอกสาร" },
                ].map((tool, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const selectedIds = sources.filter((s) => s.selected).map((s) => s.id);
                      if (selectedIds.length > 0) {
                        sendMessage(tool.prompt, selectedIds);
                      }
                    }}
                    className="p-3 rounded-xl bg-[#131314] border border-[#282a2e] hover:border-[#444746] hover:bg-[#28292c]/40 text-left transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="text-xs font-medium text-[#e3e3e3] group-hover:text-[#a8c7fa] transition-colors">
                      {tool.title}
                    </div>
                    <div className="text-[10px] text-[#8e918f] mt-0.5">Click to generate</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Studio Notes Management Section */}
            <NotesSection />
          </div>
        </div>
      )}
    </aside>
  );
};
