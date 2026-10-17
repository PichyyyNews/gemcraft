import React, { useState, useEffect } from "react";
import { Check, Server, Key, Sliders, Cpu } from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../common/dialog";
import { Button } from "../common/button";
import { Input } from "../common/input";
import type { LlmConfig, LlmProviderType } from "../../types/ipc";

export const SettingsModal: React.FC = () => {
  const { config, isSettingsOpen, setSettingsOpen, saveConfig } = useSettingsStore();
  const [formData, setFormData] = useState<LlmConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...config });
  }, [config, isSettingsOpen]);

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
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-md select-none border-slate-800 bg-slate-900 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <DialogTitle>LLM & Inference Configuration</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
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
            <Input
              type="text"
              value={formData.endpointUrl}
              onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
              className="font-mono text-slate-200"
              required
            />
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              Model Identifier
            </label>
            <Input
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              className="font-mono text-slate-200"
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
              <Input
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                className="font-mono text-slate-200"
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

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
