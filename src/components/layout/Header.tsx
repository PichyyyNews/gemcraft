import React, { useState } from "react";
import {
  ArrowLeft,
  Settings,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { ApiBridge } from "../../services/ipc";
import { GemcraftLogo } from "../common/GemcraftLogo";

export const Header: React.FC = () => {
  const { config, setSettingsOpen } = useSettingsStore();
  const [notebookTitle, setNotebookTitle] = useState("Gemcraft Notebook");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const isTauri = ApiBridge.isTauri();

  return (
    <header className="h-14 border-b border-[#282a2e] bg-[#1e1f20] px-4 flex items-center justify-between select-none shrink-0 z-10 text-[#e3e3e3]">
      {/* Left side: Back & Notebook Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {}}
          className="p-1.5 rounded-full hover:bg-[#2c2d30] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
          title="Back to notebooks"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <GemcraftLogo className="w-6 h-6 object-contain" alt="Gemcraft" />

          {isEditingTitle ? (
            <input
              type="text"
              value={notebookTitle}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditingTitle(false);
              }}
              onChange={(e) => setNotebookTitle(e.target.value)}
              className="text-sm font-medium bg-[#131314] px-2 py-0.5 rounded border border-[#a8c7fa] focus:outline-none text-white font-sans"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-medium text-[#e3e3e3] hover:text-white hover:bg-[#2c2d30] px-2 py-1 rounded transition-colors text-left flex items-center gap-1.5 cursor-pointer font-sans"
              title="Click to rename notebook"
            >
              <span>{notebookTitle}</span>
            </button>
          )}
        </div>
      </div>

      {/* Right side: Share, Environment & Settings */}
      <div className="flex items-center gap-2">
        {/* Environment Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131314] border border-[#282a2e] text-[11px] font-medium text-[#c4c7c5]">
          {isTauri ? (
            <>
              <ShieldCheck className="w-3 h-3 text-[#7ada94]" />
              <span className="font-mono text-[10px] text-[#7ada94]">Tauri Native</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3 h-3 text-[#ffdd83]" />
              <span className="font-mono text-[10px] text-[#ffdd83]">Mock Web</span>
            </>
          )}
        </div>

        {/* Model Engine Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131314] border border-[#282a2e] text-[11px] font-medium text-[#c4c7c5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a8c7fa] animate-pulse" />
          <span className="capitalize text-[#e3e3e3]">{config.provider}</span>
          <span className="text-[#8e918f] font-mono text-[10px]">({config.modelName.split(":")[0]})</span>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-[#2c2d30] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
          title="Notebook Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User avatar indicator */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#694fa8] to-[#9274da] text-white flex items-center justify-center text-xs font-semibold shadow-sm ml-1">
          P
        </div>
      </div>
    </header>
  );
};
