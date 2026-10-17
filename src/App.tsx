import { useEffect } from "react";
import { Titlebar } from "./components/layout/Titlebar";
import { SourcesPanel } from "./components/sources/SourcesPanel";
import { ChatPanel } from "./components/chat/ChatPanel";
import { CitationInspector } from "./components/viewer/CitationInspector";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useSourceStore } from "./store/useSourceStore";
import { useSettingsStore } from "./store/useSettingsStore";

export function App() {
  const fetchSources = useSourceStore((state) => state.fetchSources);
  const fetchConfig = useSettingsStore((state) => state.fetchConfig);

  useEffect(() => {
    fetchSources();
    fetchConfig();
  }, [fetchSources, fetchConfig]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1f20] text-slate-100 overflow-hidden font-sans">
      {/* Top Consolidated Frameless Titlebar */}
      <Titlebar />

      {/* 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Knowledge Sources Panel */}
        <SourcesPanel />

        {/* Center Column: Grounded Chat & Citations */}
        <ChatPanel />

        {/* Right Column: Citation & Document Inspector */}
        <CitationInspector />
      </div>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}

export default App;

