import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import type { CitationRef } from "../../types/ipc";

interface MarkdownContentProps {
  content: string;
  citations?: CitationRef[];
  activeCitation?: CitationRef | null;
  onSelectCitation: (citation: CitationRef) => void;
  isStreaming?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  citations = [],
  activeCitation,
  onSelectCitation,
  isStreaming = false,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (index: number, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 1500);
  };

  // Helper to parse citation markers like [^1], [^2] within plain text nodes
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\^[0-9]+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[\^([0-9]+)\]/);
      if (match) {
        const citationIndex = parseInt(match[1], 10);
        const citation = citations.find((c) => c.citationIndex === citationIndex);
        const isSelected = activeCitation?.citationIndex === citationIndex;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => citation && onSelectCitation(citation)}
            className={`inline-flex items-center justify-center w-4 h-4 mx-0.5 rounded-full text-[9px] font-mono font-bold transition-all cursor-pointer align-baseline relative -top-0.5 ${
              isSelected
                ? "bg-[#a8c7fa] text-[#041e49] ring-2 ring-[#a8c7fa]/50 scale-110"
                : "bg-[#28292c] text-[#c4c7c5] border border-[#444746] hover:bg-[#37393e] hover:text-white"
            }`}
            title={
              citation
                ? `${citation.sourceName} (Page ${citation.pageNumber || 1})`
                : `Citation ${citationIndex}`
            }
          >
            {citationIndex}
          </button>
        );
      }
      return part;
    });
  };

  let codeBlockCount = 0;

  return (
    <div className="prose prose-invert max-w-none text-xs text-[#e3e3e3] leading-relaxed font-sans space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs with inline citation parser
          p({ children }) {
            return (
              <p className="whitespace-pre-wrap leading-relaxed my-1.5 text-xs text-[#e3e3e3]">
                {React.Children.map(children, (child) => {
                  if (typeof child === "string") {
                    return renderTextWithCitations(child);
                  }
                  return child;
                })}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#a8c7fa] animate-pulse align-middle rounded-xs" />
                )}
              </p>
            );
          },

          // Headers
          h1: ({ children }) => (
            <h1 className="text-base font-semibold text-white mt-3 mb-1.5">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-white mt-2.5 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-white mt-2 mb-1">{children}</h3>
          ),

          // Lists
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
          li: ({ children }) => (
            <li className="text-xs text-[#e3e3e3] leading-relaxed">
              {React.Children.map(children, (child) => {
                if (typeof child === "string") return renderTextWithCitations(child);
                return child;
              })}
            </li>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-[#282a2e] bg-[#131314]">
              <table className="w-full text-left text-xs text-[#e3e3e3] divide-y divide-[#282a2e]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#1e1f20] text-[#c4c7c5]">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-[#282a2e]/60">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-[#1e1f20]/50 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 font-medium text-[11px]">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-xs">{children}</td>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#a8c7fa] pl-3 py-1 my-2 text-xs text-[#c4c7c5] italic bg-[#1e1f20]/40 rounded-r-lg">
              {children}
            </blockquote>
          ),

          // Code blocks & Inline code
          code({ className, children }) {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-[#28292c] text-[#a8c7fa] font-mono text-[11px] border border-[#37393e]">
                  {children}
                </code>
              );
            }

            const currentCodeIndex = ++codeBlockCount;
            const codeText = String(children).replace(/\n$/, "");
            const language = className?.replace(/language-/, "") || "text";

            return (
              <div className="relative my-3 rounded-xl border border-[#282a2e] bg-[#131314] overflow-hidden group">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1f20] border-b border-[#282a2e] text-[10px] text-[#8e918f] font-mono">
                  <span>{language}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentCodeIndex, codeText)}
                    className="flex items-center gap-1 hover:text-[#e3e3e3] transition-colors cursor-pointer"
                  >
                    {copiedCodeIndex === currentCodeIndex ? (
                      <>
                        <Check className="w-3 h-3 text-[#7ada94]" />
                        <span className="text-[#7ada94]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-[11px] font-mono text-[#e3e3e3] overflow-x-auto leading-relaxed">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
