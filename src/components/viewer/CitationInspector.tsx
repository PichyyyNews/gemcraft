import React from "react";
import { X, ExternalLink, Bookmark, Sparkles, BookOpen } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useSourceStore } from "../../store/useSourceStore";

export const CitationInspector: React.FC = () => {
  const { activeCitation, setActiveCitation } = useChatStore();
  const { activeDocument, setActiveDocument } = useSourceStore();

  if (!activeCitation && !activeDocument) {
    return null;
  }

  const handleClose = () => {
    setActiveCitation(null);
    setActiveDocument(null);
  };

  const title = activeCitation
    ? `Citation [^${activeCitation.citationIndex}] Evidence`
    : activeDocument?.name || "Document Preview";

  return (
    <aside className="w-96 h-full border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0 animate-in slide-in-from-right duration-200 z-10 shadow-2xl select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          {activeCitation ? (
            <Bookmark className="w-4 h-4 text-cyan-400" />
          ) : (
            <BookOpen className="w-4 h-4 text-blue-400" />
          )}
          <h3 className="text-xs font-semibold text-slate-200 tracking-wide">{title}</h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Source metadata card */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="text-[11px] font-mono text-cyan-400 flex items-center justify-between">
            <span>SOURCE FILE</span>
            {activeCitation?.relevanceScore && (
              <span className="text-emerald-400 font-semibold">
                Match: {(activeCitation.relevanceScore * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-slate-200 break-all flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{activeCitation?.sourceName || activeDocument?.name}</span>
          </div>
          {activeCitation?.pageNumber && (
            <div className="text-[11px] text-slate-400">
              Page / Section:{" "}
              <span className="text-slate-200 font-mono">Page {activeCitation.pageNumber}</span>
            </div>
          )}
        </div>

        {/* Grounded Citation Snippet Highlight */}
        {activeCitation && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grounded Excerpt from Local Vector Store:</span>
            </div>

            <blockquote className="p-3.5 rounded-lg bg-cyan-950/20 border-l-2 border-cyan-500 text-xs text-slate-200 leading-relaxed font-mono shadow-inner select-text">
              "{activeCitation.snippet}"
            </blockquote>
          </div>
        )}

        {/* Document Overview Card */}
        {activeDocument && !activeCitation && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Chunks:</span>
                <span className="font-mono text-slate-200">{activeDocument.chunkCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>File Size:</span>
                <span className="font-mono text-slate-200">{activeDocument.byteSize} bytes</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ingested:</span>
                <span className="font-mono text-slate-200">
                  {new Date(activeDocument.uploadedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              เอกสารนี้ถูกประมวลผลเป็น Vector Chunks เรียบร้อยแล้ว ข้อความทั้งหมดถูกเก็บใน SQLite-vec
              และพร้อมตอบคำถามโดยอ้างอิงแหล่งที่มา
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Citation Verification: OK</span>
        <span className="font-mono text-[10px]">NotebookLM Spec</span>
      </div>
    </aside>
  );
};
