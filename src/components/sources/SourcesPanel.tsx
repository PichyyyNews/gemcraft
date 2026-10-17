import React, { useRef, useState } from "react";
import {
  FileText,
  FileCode,
  Files,
  Plus,
  Trash2,
  Check,
  UploadCloud,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useSourceStore } from "../../store/useSourceStore";
import { useChatStore } from "../../store/useChatStore";
import { formatBytes } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../common/dialog";
import { Button } from "../common/button";
import type { SourceDocument, SupportedFileType } from "../../types/ipc";

export const SourcesPanel: React.FC = () => {
  const {
    sources,
    toggleSource,
    addSource,
    deleteSource,
    setActiveDocument,
  } = useSourceStore();
  const { setActiveCitation } = useChatStore();

  const [isDragging, setIsDragging] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<SourceDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = sources.filter((s) => s.selected).length;
  const isAllSelected = sources.length > 0 && selectedCount === sources.length;

  const handleToggleAll = () => {
    const nextState = !isAllSelected;
    sources.forEach((s) => toggleSource(s.id, nextState));
  };

  const processFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    let fileType: SupportedFileType | null = null;

    if (lowerName.endsWith(".pdf")) fileType = "pdf";
    else if (lowerName.endsWith(".md")) fileType = "markdown";
    else if (lowerName.endsWith(".txt")) fileType = "txt";

    if (!fileType) {
      alert("รองรับเฉพาะไฟล์ .pdf, .md, หรือ .txt เท่านั้น");
      return;
    }

    addSource(file.name, fileType, file.size);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => processFile(file));
    }
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

  const handleSelectDoc = (src: SourceDocument) => {
    setActiveDocument(src);
    setActiveCitation(null);
  };

  const confirmDelete = async () => {
    if (sourceToDelete) {
      await deleteSource(sourceToDelete.id);
      setSourceToDelete(null);
    }
  };

  const renderStatusBadge = (src: SourceDocument) => {
    if (!src.status || src.status === "ready") {
      return (
        <div className="flex items-center justify-between text-[11px] text-[#8e918f] pl-6 font-sans">
          <span>{src.chunkCount} chunks</span>
          <span>{formatBytes(src.byteSize)}</span>
        </div>
      );
    }

    if (src.status === "error") {
      return (
        <div className="flex items-center gap-1.5 text-[11px] text-[#f28b82] pl-6 font-sans">
          <AlertTriangle className="w-3 h-3" />
          <span>Ingestion failed</span>
        </div>
      );
    }

    const stageLabels: Record<string, string> = {
      uploading: "Uploading file...",
      chunking: "Extracting chunks...",
      embedding: "Computing embeddings...",
    };

    return (
      <div className="pl-6 space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[10px] text-[#a8c7fa] font-mono">
          <span className="flex items-center gap-1">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            {stageLabels[src.status] || "Processing..."}
          </span>
          <span>{src.progress || 50}%</span>
        </div>
        <div className="w-full h-1 bg-[#131314] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#a8c7fa] to-[#c5bfff] transition-all duration-300 rounded-full"
            style={{ width: `${src.progress || 50}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <aside
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-72 h-full border-r border-[#282a2e] bg-[#1e1f20] flex flex-col shrink-0 select-none relative transition-all ${
        isDragging ? "ring-2 ring-inset ring-[#a8c7fa]" : ""
      }`}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-[#1e1f20]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#a8c7fa] m-2 rounded-2xl animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-full bg-[#28292c] flex items-center justify-center text-[#a8c7fa] mb-3 shadow-lg">
            <UploadCloud className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-sm font-medium text-[#e3e3e3]">Drop files to index</h4>
          <p className="text-[11px] text-[#8e918f] mt-1">Supports PDF, Markdown, and TXT</p>
        </div>
      )}

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

        {/* NotebookLM "+ Add sources" Button */}
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
              Drag & drop files here or click Add sources
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

                {/* Delete button (Opens confirmation dialog) */}
                <button
                  onClick={() => setSourceToDelete(src)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#8e918f] hover:text-[#f28b82] transition-all rounded hover:bg-[#37393e] cursor-pointer"
                  title="Remove Source"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Status and Progress */}
              {renderStatusBadge(src)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!sourceToDelete} onOpenChange={(open) => !open && setSourceToDelete(null)}>
        <DialogContent className="sm:max-w-sm border-[#282a2e] bg-[#1e1f20] text-[#e3e3e3]">
          <DialogHeader>
            <DialogTitle>Remove source from notebook?</DialogTitle>
            <DialogDescription className="text-xs text-[#8e918f] pt-1 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-[#e3e3e3] font-medium">{sourceToDelete?.name}</strong>?
              This will remove its text chunks and vector embeddings from local memory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSourceToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
