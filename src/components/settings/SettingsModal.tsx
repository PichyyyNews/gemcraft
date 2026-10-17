import React, { useState, useEffect } from "react";
import { X, Check, Server, Key, Sliders, Cpu } from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";
import type { LlmConfig, LlmProviderType } from "../../types/ipc";

export const SettingsModal: React.FC = () => {
  const { config, isSettingsOpen, setSettingsOpen, saveConfig } = useSettingsStore();
  const [formData, setFormData] = useState<LlmConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...config });
  }, [config, isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleProviderChange = (provider: LlmProviderType) => {
    let endpointUrl = formData.endpointUrl;
    let modelName = formData.modelName;

    if (provider === "ollama") {
      endpointUrl = "http://localhost:11434";
      modelName = "llama3.2:latest";
    } else if (provider === "gemini") {
      endpointUrl = "https://generativelanguage.googleapis.com";
      modelName = "gemini-1.5-pro";
    } else if (provider === "openai") {
      endpointUrl = "https://api.openai.com/v1";
      modelName = "gpt-4o-mini";
    }

    setFormData({
      ...formData,
      provider,
      endpointUrl,
      modelName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSettingsOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">LLM & Inference Configuration</h3>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Inference Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {(["ollama", "gemini", "openai"] as LlmProviderType[]).map((prov) => (
                <button
                  type="button"
                  key={prov}
                  onClick={() => handleProviderChange(prov)}
                  className={`py-2 px-3 rounded-lg border font-medium text-center capitalize transition-all cursor-pointer ${
                    formData.provider === prov
                      ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {prov === "ollama" ? "Ollama (Local)" : prov}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              API Endpoint
            </label>
            <input
              type="text"
              value={formData.endpointUrl}
              onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none font-mono text-slate-200"
              required
            />
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              Model Identifier
            </label>
            <input
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none font-mono text-slate-200"
              required
            />
          </div>

          {/* API Key (if cloud) */}
          {formData.provider !== "ollama" && (
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                API Key (Stored locally in secure keyring)
              </label>
              <input
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none font-mono text-slate-200"
              />
            </div>
          )}

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Temperature (Strict Grounding)
              </span>
              <span className="font-mono text-cyan-400 font-semibold">{formData.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all shadow-sm shadow-cyan-600/30 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
