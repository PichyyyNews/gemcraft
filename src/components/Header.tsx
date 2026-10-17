import React from "react";
import { Cpu, Settings, ShieldCheck, Terminal } from "lucide-react";
import type { LlmConfig } from "../types/ipc";

interface HeaderProps {
  config: LlmConfig;
  onOpenSettings: () => void;
  isTauri: boolean;
}

export const Header: React.FC<HeaderProps> = ({ config, onOpenSettings, isTauri }) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 flex items-center justify-between select-none shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm tracking-tight">Gemcraft</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              RAG Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Local-first Source Grounded Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <ShieldCheck className={`w-3.5 h-3.5 ${isTauri ? "text-emerald-400" : "text-amber-400"}`} />
          <span className="text-slate-300 font-mono text-[11px]">
            {isTauri ? "Tauri IPC Native" : "Mock Browser Mode"}
          </span>
        </div>

        {/* LLM Engine Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 capitalize">{config.provider}:</span>
          <span className="font-mono text-cyan-300 font-medium text-[11px]">{config.modelName}</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          title="Configuration & LLM Settings"
          aria-label="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
