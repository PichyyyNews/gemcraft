import React, { useState } from "react";
import {
  Minus,
  Square,
  X,
  Settings,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettingsStore } from "../../store/useSettingsStore";
import { ApiBridge } from "../../services/ipc";

export const Titlebar: React.FC = () => {
  const { config, setSettingsOpen } = useSettingsStore();
  const [notebookTitle, setNotebookTitle] = useState("Gemcraft Notebook");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const isTauri = ApiBridge.isTauri();

  const handleMinimize = async () => {
    if (isTauri) {
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    }
  };

  const handleToggleMaximize = async () => {
    if (isTauri) {
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
    }
  };

  const handleClose = async () => {
    if (isTauri) {
      const appWindow = getCurrentWindow();
      await appWindow.close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-[#1e1f20] border-b border-[#282a2e] flex items-center justify-between select-none shrink-0 z-50 text-[#c4c7c5] text-xs font-sans px-3"
    >
      {/* Left side: Logo & Menus */}
      <div className="flex items-center gap-2 pointer-events-auto" data-tauri-drag-region>
        {/* App Logo - logo (1).svg */}
        <div
          className="flex items-center justify-center p-1 rounded hover:bg-[#282a2e]/60 cursor-pointer transition-colors"
          title="Gemcraft"
        >
          <img
            src="/logo (1).svg"
            alt="Gemcraft Logo"
            className="w-4 h-4 object-contain"
          />
        </div>

        {/* Window Menu Items */}
        <div className="flex items-center gap-0.5 text-[#9aa0a6] mr-2">
          <button
            type="button"
            className="px-2 py-0.5 rounded hover:bg-[#282a2e] hover:text-[#e3e3e3] transition-colors cursor-pointer text-xs"
            onClick={() => {}}
          >
            File
          </button>
          <button
            type="button"
            className="px-2 py-0.5 rounded hover:bg-[#282a2e] hover:text-[#e3e3e3] transition-colors cursor-pointer text-xs"
            onClick={() => {}}
          >
            View
          </button>
          <button
            type="button"
            className="px-2 py-0.5 rounded hover:bg-[#282a2e] hover:text-[#e3e3e3] transition-colors cursor-pointer text-xs"
            onClick={() => {}}
          >
            Window
          </button>
        </div>

        {/* Notebook Title Pill */}
        <div className="flex items-center">
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
              className="text-xs font-medium bg-[#131314] px-2 py-0.5 rounded border border-[#a8c7fa] focus:outline-none text-white font-sans"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2e] px-2 py-0.5 rounded transition-colors text-left flex items-center gap-1.5 cursor-pointer font-sans"
              title="Click to rename notebook"
            >
              <span>{notebookTitle}</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle: Draggable Spacer */}
      <div className="flex-1 h-full" data-tauri-drag-region />

      {/* Right side: Status Pills, Settings & Window Controls */}
      <div className="flex items-center h-full gap-2">
        {/* Environment Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#131314] border border-[#282a2e] text-[11px] font-medium text-[#c4c7c5]">
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
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#131314] border border-[#282a2e] text-[11px] font-medium text-[#c4c7c5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a8c7fa] animate-pulse" />
          <span className="capitalize text-[#e3e3e3]">{config.provider}</span>
          <span className="text-[#8e918f] font-mono text-[10px]">({config.modelName.split(":")[0]})</span>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1 rounded-full hover:bg-[#282a2e] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
          title="Notebook Settings"
          aria-label="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* User avatar indicator */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#694fa8] to-[#9274da] text-white flex items-center justify-center text-[10px] font-semibold shadow-sm ml-0.5 mr-1">
          P
        </div>

        {/* Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center h-full -mr-3 border-l border-[#282a2e]/50 pl-1">
          <button
            type="button"
            onClick={handleMinimize}
            className="h-full px-3 flex items-center justify-center hover:bg-[#282a2e] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
            title="Minimize"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleMaximize}
            className="h-full px-3 flex items-center justify-center hover:bg-[#282a2e] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
            title="Maximize"
            aria-label="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="h-full px-3 flex items-center justify-center hover:bg-[#e81123] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Titlebar;
