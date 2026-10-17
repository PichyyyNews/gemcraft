import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SourcesPanel } from "./components/SourcesPanel";
import { ChatPanel } from "./components/ChatPanel";
import { CitationInspector } from "./components/CitationInspector";
import { SettingsModal } from "./components/SettingsModal";
import { ApiBridge } from "./services/ipc";
import type {
  SourceDocument,
  ChatMessage,
  CitationRef,
  LlmConfig,
} from "./types/ipc";

export function App() {
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [config, setConfig] = useState<LlmConfig>({
    provider: "ollama",
    endpointUrl: "http://localhost:11434",
    modelName: "llama3.2:latest",
    temperature: 0.2,
  });

  const [activeCitation, setActiveCitation] = useState<CitationRef | null>(null);
  const [activeDocument, setActiveDocument] = useState<SourceDocument | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const isTauri = ApiBridge.isTauri();

  useEffect(() => {
    // Initial fetch of sources and configuration
    const init = async () => {
      try {
        const [loadedSources, loadedConfig] = await Promise.all([
          ApiBridge.getSources(),
          ApiBridge.getConfig(),
        ]);
        setSources(loadedSources);
        setConfig(loadedConfig);
      } catch (err) {
        console.error("Failed to initialize workspace data", err);
      }
    };
    init();
  }, []);

  const handleToggleSource = async (id: string, selected: boolean) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, selected } : s)));
    try {
      await ApiBridge.toggleSourceSelection(id, selected);
    } catch (err) {
      console.error("Error toggling source selection", err);
    }
  };

  const handleAddSource = async (
    fileName: string,
    fileType: "pdf" | "markdown" | "txt",
    byteSize: number
  ) => {
    try {
      const res = await ApiBridge.ingestDocument(fileName, fileType, byteSize);
      if (res.success && res.source) {
        setSources((prev) => [res.source!, ...prev]);
        setActiveDocument(res.source);
        setActiveCitation(null);
      }
    } catch (err) {
      console.error("Error ingesting source", err);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const success = await ApiBridge.deleteSource(id);
      if (success) {
        setSources((prev) => prev.filter((s) => s.id !== id));
        if (activeDocument?.id === id) {
          setActiveDocument(null);
        }
      }
    } catch (err) {
      console.error("Error deleting source", err);
    }
  };

  const handleSendMessage = async (query: string) => {
    const selectedSourceIds = sources.filter((s) => s.selected).map((s) => s.id);
    if (selectedSourceIds.length === 0) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const assistantMessage = await ApiBridge.queryRag({
        query,
        selectedSourceIds,
      });
      setMessages((prev) => [...prev, assistantMessage]);

      // Automatically open the first citation in inspector if available
      if (assistantMessage.citations && assistantMessage.citations.length > 0) {
        setActiveCitation(assistantMessage.citations[0]);
        setActiveDocument(null);
      }
    } catch (err) {
      console.error("Error querying RAG", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ Inference Engine กรุณาตรวจสอบการตั้งค่า Provider",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCitation = (citation: CitationRef) => {
    setActiveCitation(citation);
    setActiveDocument(null);
  };

  const handleSelectDocumentForPreview = (source: SourceDocument) => {
    setActiveDocument(source);
    setActiveCitation(null);
  };

  const handleSaveConfig = async (newConfig: LlmConfig) => {
    setConfig(newConfig);
    try {
      await ApiBridge.saveConfig(newConfig);
    } catch (err) {
      console.error("Error saving config", err);
    }
  };

  const selectedCount = sources.filter((s) => s.selected).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Application Header */}
      <Header
        config={config}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTauri={isTauri}
      />

      {/* 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Knowledge Sources Panel */}
        <SourcesPanel
          sources={sources}
          onToggleSource={handleToggleSource}
          onAddSource={handleAddSource}
          onDeleteSource={handleDeleteSource}
          onSelectDocumentForPreview={handleSelectDocumentForPreview}
        />

        {/* Center Column: Grounded Chat & Citations */}
        <ChatPanel
          messages={messages}
          loading={loading}
          selectedSourceCount={selectedCount}
          onSendMessage={handleSendMessage}
          onSelectCitation={handleSelectCitation}
        />

        {/* Right Column: Citation & Document Inspector */}
        <CitationInspector
          activeCitation={activeCitation}
          activeDocument={activeDocument}
          onClose={() => {
            setActiveCitation(null);
            setActiveDocument(null);
          }}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

export default App;
