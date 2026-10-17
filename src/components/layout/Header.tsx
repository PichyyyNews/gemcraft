import React from "react";
import {
  Settings,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { ApiBridge } from "../../services/ipc";

export const Header: React.FC = () => {
  const { config, setSettingsOpen } = useSettingsStore();
  const isTauri = ApiBridge.isTauri();

  return (
    <header className="h-14 border-b border-[#282a2e] bg-[#1e1f20] px-4 flex items-center justify-between select-none shrink-0 z-10 text-[#e3e3e3]">
      {/* Left side spacer to preserve alignment with macOS traffic lights */}
      <div className="flex items-center gap-3" />


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
