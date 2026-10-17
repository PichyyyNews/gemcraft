import React, { useRef } from "react";
import {
  FileText,
  FileCode,
  Files,
  Plus,
  Trash2,
  Check,
  UploadCloud,
} from "lucide-react";
import { useSourceStore } from "../../store/useSourceStore";
import { useChatStore } from "../../store/useChatStore";
import { formatBytes } from "../../lib/utils";
import type { SupportedFileType } from "../../types/ipc";

export const SourcesPanel: React.FC = () => {
  const {
    sources,
    toggleSource,
    addSource,
    deleteSource,
    setActiveDocument,
  } = useSourceStore();
  const { setActiveCitation } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = sources.filter((s) => s.selected).length;
  const isAllSelected = sources.length > 0 && selectedCount === sources.length;

  const handleToggleAll = () => {
    const nextState = !isAllSelected;
    sources.forEach((s) => toggleSource(s.id, nextState));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fileType: SupportedFileType = "txt";
    if (file.name.endsWith(".pdf")) fileType = "pdf";
    else if (file.name.endsWith(".md")) fileType = "markdown";

    addSource(file.name, fileType, file.size);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleQuickAddSample = () => {
    const samples = [
      { name: "sqlite_vector_benchmarks.pdf", type: "pdf" as const, size: 1845000 },
      { name: "system_architecture_spec.md", type: "markdown" as const, size: 8400 },
      { name: "ollama_endpoint_guide.txt", type: "txt" as const, size: 3200 },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    addSource(pick.name, pick.type, pick.size);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-[#f28b82]" />;
      case "markdown":
        return <FileCode className="w-4 h-4 text-[#a8c7fa]" />;
      default:
        return <Files className="w-4 h-4 text-[#81c995]" />;
    }
  };

  const handleSelectDoc = (src: (typeof sources)[0]) => {
    setActiveDocument(src);
    setActiveCitation(null);
  };

  return (
    <aside className="w-72 h-full border-r border-[#282a2e] bg-[#1e1f20] flex flex-col shrink-0 select-none">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-[#282a2e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-[#e3e3e3]">Sources</h2>
            <span className="text-xs text-[#8e918f] font-mono">({sources.length})</span>
          </div>

          {sources.length > 0 && (
            <button
              onClick={handleToggleAll}
              className="text-[11px] text-[#a8c7fa] hover:text-[#d3e3fd] transition-colors cursor-pointer"
            >
              {isAllSelected ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        {/* NotebookLM Signature "+ Add source" Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.md,.txt"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border border-[#444746] bg-[#131314] hover:bg-[#28292c] hover:border-[#8e918f] text-xs font-medium text-[#e3e3e3] hover:text-white transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#a8c7fa]" />
          <span>Add sources</span>
        </button>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sources.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-[#131314] border border-[#282a2e] flex items-center justify-center text-[#8e918f] mb-3">
              <UploadCloud className="w-5 h-5 text-[#8e918f]" />
            </div>
            <p className="text-xs font-medium text-[#e3e3e3]">No sources added</p>
            <p className="text-[11px] text-[#8e918f] mt-1 leading-relaxed">
              Upload PDF or Markdown to ground AI answers
            </p>
            <button
              onClick={handleQuickAddSample}
              className="mt-3 text-xs text-[#a8c7fa] hover:underline cursor-pointer"
            >
              + Add sample source
            </button>
          </div>
        ) : (
          sources.map((src) => (
            <div
              key={src.id}
              className={`group relative rounded-xl border p-2.5 transition-all text-xs flex flex-col gap-1.5 ${
                src.selected
                  ? "bg-[#28292c] border-[#444746] text-[#e3e3e3] shadow-sm"
                  : "bg-[#131314]/80 border-[#282a2e] text-[#8e918f] opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Google Material Checkbox */}
                <button
                  onClick={() => toggleSource(src.id, !src.selected)}
                  className="mt-0.5 text-[#8e918f] hover:text-[#a8c7fa] transition-colors cursor-pointer shrink-0"
                  title={src.selected ? "Exclude from grounding" : "Include in grounding"}
                >
                  <div
                    className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all ${
                      src.selected
                        ? "bg-[#a8c7fa] text-[#041e49]"
                        : "border border-[#8e918f] bg-transparent"
                    }`}
                  >
                    {src.selected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                {/* File Title & Icon */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleSelectDoc(src)}
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(src.fileType)}
                    <span className="font-medium text-xs truncate hover:text-[#a8c7fa] transition-colors">
                      {src.name}
                    </span>
                  </div>
                </div>

                {/* Delete source button */}
                <button
                  onClick={() => deleteSource(src.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#8e918f] hover:text-[#f28b82] transition-all rounded hover:bg-[#37393e] cursor-pointer"
                  title="Remove Source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtitle info */}
              <div className="flex items-center justify-between text-[11px] text-[#8e918f] pl-6">
                <span>{src.chunkCount} chunks</span>
                <span>{formatBytes(src.byteSize)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel Bottom Footer */}
      <div className="p-3 border-t border-[#282a2e] bg-[#1e1f20] flex items-center justify-between text-[11px] text-[#8e918f]">
        <span>{selectedCount} of {sources.length} active</span>
        <button
          onClick={handleQuickAddSample}
          className="text-[#a8c7fa] hover:text-[#d3e3fd] transition-colors cursor-pointer"
        >
          + Quick Sample
        </button>
      </div>
    </aside>
  );
};
