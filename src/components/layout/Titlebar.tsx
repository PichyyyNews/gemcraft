import React, { useState } from "react";
import {
  Minus,
  Square,
  X,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ApiBridge } from "../../services/ipc";

export const Titlebar: React.FC = () => {
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
        {/* App Logo - logo (1).svg */}
        <div
          className="flex items-center justify-center p-0.5 rounded hover:bg-[#282a2e]/60 cursor-pointer transition-colors"
          title="Gemcraft"
        >
          <img
            src="/logo (1).svg"
            alt="Gemcraft Logo"
            className="w-5 h-5 object-contain"
          />
        </div>

        {/* Notebook Title Pill (Placed before File menu) */}
        <div className="flex items-center mr-1">
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
              className="text-xs font-medium text-[#e3e3e3] hover:text-white hover:bg-[#282a2e] px-2 py-0.5 rounded transition-colors text-left flex items-center gap-1.5 cursor-pointer font-sans"
              title="Click to rename notebook"
            >
              <span>{notebookTitle}</span>
            </button>
          )}
        </div>

        {/* Window Menu Items */}
        <div className="flex items-center gap-0.5 text-[#9aa0a6]">
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
      </div>

      {/* Middle: Draggable Spacer */}
      <div className="flex-1 h-full" data-tauri-drag-region />

      {/* Right side: Native-style Window Controls */}
      <div className="flex items-center h-full -mr-3">
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
  );
};
export default Titlebar;
