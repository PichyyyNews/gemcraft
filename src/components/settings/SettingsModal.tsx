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
      <DialogContent className="sm:max-w-md select-none border-[#444746] bg-[#1e1f20] text-[#e3e3e3] shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#a8c7fa]" />
            <DialogTitle className="text-white text-sm font-semibold">
              LLM & Inference Configuration
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-[#8e918f] font-medium">Inference Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {(["ollama", "gemini", "openai"] as LlmProviderType[]).map((prov) => (
                <button
                  type="button"
                  key={prov}
                  onClick={() => handleProviderChange(prov)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-center capitalize transition-all cursor-pointer ${
                    formData.provider === prov
                      ? "bg-[#a8c7fa]/15 border-[#a8c7fa] text-[#a8c7fa] shadow-sm font-semibold"
                      : "bg-[#131314] border-[#282a2e] text-[#8e918f] hover:border-[#444746] hover:text-[#e3e3e3]"
                  }`}
                >
                  {prov === "ollama" ? "Ollama (Local)" : prov}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-1.5">
            <label className="text-[#8e918f] font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#8e918f]" />
              API Endpoint
            </label>
            <Input
              type="text"
              value={formData.endpointUrl}
              onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
              className="font-mono text-xs text-[#e3e3e3] bg-[#131314] border-[#444746] focus:border-[#a8c7fa]"
              required
            />
          </div>

          {/* Model Name */}
          <div className="space-y-1.5">
            <label className="text-[#8e918f] font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#8e918f]" />
              Model Identifier
            </label>
            <Input
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              className="font-mono text-xs text-[#e3e3e3] bg-[#131314] border-[#444746] focus:border-[#a8c7fa]"
              required
            />
          </div>

          {/* API Key (if cloud) */}
          {formData.provider !== "ollama" && (
            <div className="space-y-1.5">
              <label className="text-[#8e918f] font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#fdd663]" />
                API Key (Stored locally in secure keyring)
              </label>
              <Input
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                className="font-mono text-xs text-[#e3e3e3] bg-[#131314] border-[#444746] focus:border-[#a8c7fa]"
              />
            </div>
          )}

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#8e918f]">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8e918f]" />
                Temperature (Strict Grounding)
              </span>
              <span className="font-mono text-[#a8c7fa] font-semibold">{formData.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full accent-[#a8c7fa] cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettingsOpen(false)}
              className="border-[#444746] bg-transparent text-[#8e918f] hover:bg-[#28292c] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#a8c7fa] hover:bg-[#d3e3fd] text-[#041e49] font-medium shadow-sm cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
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
