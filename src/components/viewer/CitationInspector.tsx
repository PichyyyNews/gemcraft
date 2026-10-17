import React, { useState } from "react";
import { X, Sparkles, Copy, Check, FileText } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useSourceStore } from "../../store/useSourceStore";
import { formatBytes } from "../../lib/utils";

export const CitationInspector: React.FC = () => {
  const { activeCitation, setActiveCitation } = useChatStore();
  const { activeDocument, setActiveDocument } = useSourceStore();
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!activeCitation && !activeDocument) {
    return null;
  }

  const handleClose = () => {
    setActiveCitation(null);
    setActiveDocument(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  return (
    <aside className="w-80 h-full border-l border-[#282a2e] bg-[#1e1f20] flex flex-col shrink-0 animate-in slide-in-from-right duration-150 z-10 select-none text-[#e3e3e3]">
      {/* Studio Header */}
      <div className="p-4 border-b border-[#282a2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c5bfff]" />
          <h3 className="text-sm font-medium text-[#e3e3e3]">Studio & Citations</h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full text-[#8e918f] hover:text-white hover:bg-[#2c2d30] transition-colors cursor-pointer"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeCitation ? (
          <div className="space-y-3">
            {/* Citation Pill Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#a8c7fa] text-[#041e49] flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                  {activeCitation.citationIndex}
                </div>
                <span className="text-xs font-medium text-[#e3e3e3]">Citation Source</span>
              </div>
              {activeCitation.relevanceScore && (
                <span className="text-[11px] font-mono text-[#7ada94]">
                  {(activeCitation.relevanceScore * 100).toFixed(0)}% match
                </span>
              )}
            </div>

            {/* Document metadata card */}
            <div className="p-3 rounded-xl bg-[#131314] border border-[#282a2e] space-y-1">
              <div className="text-xs font-medium text-[#e3e3e3] truncate flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#a8c7fa] shrink-0" />
                <span className="truncate">{activeCitation.sourceName}</span>
              </div>
              {activeCitation.pageNumber && (
                <div className="text-[11px] text-[#8e918f]">
                  Page: <span className="text-[#c4c7c5] font-mono">{activeCitation.pageNumber}</span>
                </div>
              )}
            </div>

            {/* Quoted Passage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#8e918f]">
                <span>GROUNDED PASSAGE</span>
                <button
                  onClick={() => handleCopy(activeCitation.snippet)}
                  className="hover:text-[#e3e3e3] transition-colors flex items-center gap-1 cursor-pointer"
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

              <blockquote className="p-3.5 rounded-xl bg-[#131314] border border-[#282a2e] text-xs text-[#e3e3e3] leading-relaxed font-sans select-text">
                "{activeCitation.snippet}"
              </blockquote>
            </div>
          </div>
        ) : activeDocument ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#a8c7fa]" />
              <h4 className="text-xs font-medium text-[#e3e3e3] truncate">{activeDocument.name}</h4>
            </div>

            <div className="p-3 rounded-xl bg-[#131314] border border-[#282a2e] space-y-2 text-xs">
              <div className="flex justify-between text-[#8e918f]">
                <span>Chunks:</span>
                <span className="text-[#e3e3e3] font-mono">{activeDocument.chunkCount}</span>
              </div>
              <div className="flex justify-between text-[#8e918f]">
                <span>Size:</span>
                <span className="text-[#e3e3e3] font-mono">{formatBytes(activeDocument.byteSize)}</span>
              </div>
              <div className="flex justify-between text-[#8e918f]">
                <span>Status:</span>
                <span className="text-[#7ada94] font-medium">Indexed & Active</span>
              </div>
            </div>

            <p className="text-xs text-[#8e918f] leading-relaxed">
              เอกสารนี้ถูกทำ Index ใน Vector Database เรียบร้อยแล้ว เมื่อถามคำถาม ระบบจะดึงข้อความที่ตรงกันมาอ้างอิงเป็น Citation อัตโนมัติ
            </p>
          </div>
        ) : null}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#282a2e] bg-[#1e1f20] text-[11px] text-[#8e918f] flex items-center justify-between">
        <span>Grounded Vector Store</span>
        <span className="font-mono text-[10px]">NotebookLM Core</span>
      </div>
    </aside>
  );
};
