import React, { useRef } from "react";
import {
  FileText,
  FileCode,
  Files,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Database,
  Layers,
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
  const totalChunks = sources.reduce(
    (acc, curr) => (curr.selected ? acc + curr.chunkCount : acc),
    0
  );

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
        return <FileText className="w-4 h-4 text-rose-400" />;
      case "markdown":
        return <FileCode className="w-4 h-4 text-sky-400" />;
      default:
        return <Files className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handleSelectDoc = (src: (typeof sources)[0]) => {
    setActiveDocument(src);
    setActiveCitation(null);
  };

  return (
    <aside className="w-80 h-full border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0 select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Knowledge Sources
          </h2>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
            {sources.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.md,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-sm shadow-cyan-600/30 cursor-pointer"
            title="Upload PDF, Markdown, or TXT"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Grounding Stats Summary */}
      <div className="px-3.5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Active Grounding:</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-cyan-400 font-semibold">{selectedCount}</span> of {sources.length} docs
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">{totalChunks} chunks</span>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sources.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <Files className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-400">No sources indexed yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Upload a PDF or Markdown file to start grounding.</p>
            <button
              onClick={handleQuickAddSample}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Add sample document
            </button>
          </div>
        ) : (
          sources.map((src) => (
            <div
              key={src.id}
              className={`group relative rounded-lg border p-2.5 transition-all text-xs flex flex-col gap-1.5 ${
                src.selected
                  ? "bg-slate-800/50 border-cyan-800/50 hover:border-cyan-600/60 shadow-sm"
                  : "bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-90"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => toggleSource(src.id, !src.selected)}
                  className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                  title={src.selected ? "Disable from context" : "Include in context"}
                >
                  {src.selected ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-950" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleSelectDoc(src)}
                >
                  <div className="flex items-center gap-1.5">
                    {getFileIcon(src.fileType)}
                    <span className="font-medium text-slate-200 truncate hover:text-cyan-300 transition-colors">
                      {src.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteSource(src.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all rounded hover:bg-slate-800 cursor-pointer"
                  title="Remove Source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-6 font-mono">
                <span>{src.chunkCount} vector chunks</span>
                <span>{formatBytes(src.byteSize)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Ingest Footer Helper */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Embeddings: BGE-Small (Local)</span>
        <button
          onClick={handleQuickAddSample}
          className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          + Add Sample
        </button>
      </div>
    </aside>
  );
};
