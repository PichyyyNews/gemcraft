import { create } from "zustand";
import type { LlmConfig } from "../types/ipc";
import { ApiBridge } from "../services/ipc";

interface SettingsState {
  config: LlmConfig;
  isSettingsOpen: boolean;
  fetchConfig: () => Promise<void>;
  saveConfig: (newConfig: LlmConfig) => Promise<void>;
  setSettingsOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  config: {
    provider: "ollama",
    endpointUrl: "http://localhost:11434",
    modelName: "llama3.2:latest",
    temperature: 0.2,
  },
  isSettingsOpen: false,

  fetchConfig: async () => {
    try {
      const config = await ApiBridge.getConfig();
      set({ config });
    } catch (err) {
      console.error("Failed to load settings config in store", err);
    }
  },

  saveConfig: async (newConfig: LlmConfig) => {
    set({ config: newConfig });
    try {
      await ApiBridge.saveConfig(newConfig);
    } catch (err) {
      console.error("Failed to persist settings in store", err);
    }
  },

  setSettingsOpen: (open: boolean) => {
    set({ isSettingsOpen: open });
  },
}));
