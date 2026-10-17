import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Download,
  Copy,
  Check,
  StickyNote,
  X,
  ChevronDown,
} from "lucide-react";
import { useNotesStore, type StudioNote } from "../../store/useNotesStore";
import { useChatStore } from "../../store/useChatStore";

export const NotesSection: React.FC = () => {
  const { notes, createNote, updateNote, deleteNote, exportAllNotesAsMarkdown } = useNotesStore();
  const { setActiveCitation } = useChatStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const startCreateNote = () => {
    setIsCreating(true);
    setEditingNoteId(null);
    setFormTitle("");
    setFormContent("");
  };

  const startEditNote = (note: StudioNote) => {
    setEditingNoteId(note.id);
    setIsCreating(false);
    setFormTitle(note.title);
    setFormContent(note.content);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingNoteId(null);
    setFormTitle("");
    setFormContent("");
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: formTitle.trim() || "Untitled Note",
        content: formContent.trim(),
      });
      setEditingNoteId(null);
    } else {
      createNote(formTitle.trim() || "Untitled Note", formContent.trim());
      setIsCreating(false);
    }

    setFormTitle("");
    setFormContent("");
  };

  const handleCopyNote = (noteId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 1500);
  };

  const handleExportMarkdown = () => {
    const md = exportAllNotesAsMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gemcraft-notes-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-[#282a2e]">
      {/* Header toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-[#a8c7fa]" />
          <span className="text-xs font-semibold text-white tracking-wide">STUDIO NOTES</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#28292c] text-[10px] font-mono text-[#8e918f]">
            {notes.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {notes.length > 0 && (
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="p-1 rounded-md text-[#8e918f] hover:text-[#a8c7fa] hover:bg-[#28292c] transition-colors cursor-pointer"
              title="Export all notes as Markdown"
            >
              {copiedAll ? (
                <Check className="w-3.5 h-3.5 text-[#7ada94]" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={startCreateNote}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#a8c7fa]/10 hover:bg-[#a8c7fa]/20 text-[#a8c7fa] text-xs font-medium transition-all cursor-pointer border border-[#a8c7fa]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add note</span>
          </button>
        </div>
      </div>

      {/* Inline Create / Edit Form */}
      {(isCreating || editingNoteId) && (
        <form
          onSubmit={handleSaveNote}
          className="p-3 rounded-2xl bg-[#131314] border border-[#a8c7fa]/40 shadow-lg space-y-2.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#a8c7fa]">
              {editingNoteId ? "Edit Note" : "New Note"}
            </span>
            <button
              type="button"
              onClick={cancelForm}
              className="text-[#8e918f] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Note title (optional)"
            className="w-full bg-[#1e1f20] border border-[#282a2e] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-[#8e918f] focus:outline-none focus:border-[#a8c7fa]"
          />

          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Write your note here..."
            rows={3}
            className="w-full bg-[#1e1f20] border border-[#282a2e] rounded-lg p-2.5 text-xs text-[#e3e3e3] placeholder:text-[#8e918f] focus:outline-none focus:border-[#a8c7fa] resize-none leading-relaxed font-sans"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={cancelForm}
              className="px-2.5 py-1 rounded-lg text-xs text-[#8e918f] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formContent.trim()}
              className="px-3 py-1 rounded-lg bg-[#a8c7fa] hover:bg-[#d3e3fd] text-[#041e49] text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              {editingNoteId ? "Update" : "Save Note"}
            </button>
          </div>
        </form>
      )}

      {/* Note Cards List */}
      {notes.length === 0 && !isCreating ? (
        <div className="p-4 rounded-xl border border-dashed border-[#282a2e] text-center space-y-1">
          <p className="text-xs text-[#8e918f]">No notes created yet.</p>
          <p className="text-[11px] text-[#5e615f]">
            Click "+ Add note" or use the bookmark button on any AI response to pin key takeaways.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5">
          {notes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const dateStr = new Date(note.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={note.id}
                className="p-3 rounded-2xl bg-[#131314] border border-[#282a2e] hover:border-[#37393e] transition-all space-y-2 group shadow-sm"
              >
                {/* Note Header & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-white truncate">{note.title}</h5>
                    <span className="text-[10px] text-[#8e918f] font-mono">{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopyNote(note.id, `${note.title}\n\n${note.content}`)}
                      className="p-1 rounded-md hover:bg-[#28292c] text-[#8e918f] hover:text-white transition-colors cursor-pointer"
                      title="Copy note text"
                    >
                      {copiedNoteId === note.id ? (
                        <Check className="w-3 h-3 text-[#7ada94]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEditNote(note)}
                      className="p-1 rounded-md hover:bg-[#28292c] text-[#8e918f] hover:text-white transition-colors cursor-pointer"
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded-md hover:bg-[#28292c] text-[#8e918f] hover:text-[#f28b82] transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Note Body Content */}
                <div className="text-xs text-[#c4c7c5] leading-relaxed font-sans whitespace-pre-wrap select-text">
                  {isExpanded || note.content.length <= 160 ? (
                    note.content
                  ) : (
                    <>
                      {note.content.slice(0, 160)}...
                      <button
                        type="button"
                        onClick={() => setExpandedNoteId(note.id)}
                        className="text-[11px] text-[#a8c7fa] ml-1 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        more <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </>
                  )}
                  {isExpanded && note.content.length > 160 && (
                    <button
                      type="button"
                      onClick={() => setExpandedNoteId(null)}
                      className="text-[11px] text-[#8e918f] ml-1 hover:underline block mt-1"
                    >
                      show less
                    </button>
                  )}
                </div>

                {/* Citations Attached to Note */}
                {note.citations && note.citations.length > 0 && (
                  <div className="pt-2 border-t border-[#1e1f20] flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-[#8e918f]">Grounding:</span>
                    {note.citations.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveCitation(c)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1e1f20] hover:bg-[#28292c] border border-[#282a2e] text-[10px] text-[#a8c7fa] cursor-pointer transition-colors truncate max-w-[170px]"
                        title={c.snippet}
                      >
                        <span className="w-3 h-3 rounded-full bg-[#a8c7fa] text-[#041e49] text-[8px] font-bold flex items-center justify-center">
                          {c.citationIndex}
                        </span>
                        <span className="truncate">{c.sourceName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
