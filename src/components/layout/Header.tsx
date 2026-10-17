import React from "react";
import { Cpu, Settings, ShieldCheck, Terminal } from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { Button } from "../common/button";
import { Badge } from "../common/badge";
import { ApiBridge } from "../../services/ipc";

export const Header: React.FC = () => {
  const { config, setSettingsOpen } = useSettingsStore();
  const isTauri = ApiBridge.isTauri();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 flex items-center justify-between select-none shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm tracking-tight">Gemcraft</span>
            <Badge variant="cyan">RAG Studio</Badge>
          </div>
          <p className="text-[11px] text-slate-400">Local-first Source Grounded Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 py-1 px-2.5"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isTauri ? "text-emerald-400" : "text-amber-400"}`} />
          <span className="text-slate-300 font-mono text-[11px]">
            {isTauri ? "Tauri IPC Native" : "Mock Browser Mode"}
          </span>
        </Badge>

        {/* LLM Engine Indicator */}
        <Badge
          variant="secondary"
          className="flex items-center gap-1.5 py-1 px-2.5"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 capitalize">{config.provider}:</span>
          <span className="font-mono text-cyan-300 font-medium text-[11px]">{config.modelName}</span>
        </Badge>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          title="Configuration & LLM Settings"
          aria-label="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
