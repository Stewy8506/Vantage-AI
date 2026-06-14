"use client";

import React from "react";

interface CustomModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxOutputTokens?: number;
}

interface ModelsTabProps {
  customModels: CustomModel[];
  newModel: CustomModel;
  setNewModel: React.Dispatch<React.SetStateAction<CustomModel>>;
  handleAddModel: () => void;
  handleRemoveModel: (id: string) => void;
}

export default function ModelsTab({
  customModels,
  newModel,
  setNewModel,
  handleAddModel,
  handleRemoveModel,
}: ModelsTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Model Registry</h3>
        <p className="text-xs text-zinc-500">
          Register custom or local model profiles to populate agent dropdowns.
        </p>
      </div>

      <div className="typographic-form">
        {/* Add Model Form */}
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label">Register New Model</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Model Name (Display)</span>
                <input
                  type="text"
                  placeholder="e.g. Llama 3 8B"
                  className="minimal-input text-xs"
                  value={newModel.name}
                  onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Model ID (Identifier)</span>
                <input
                  type="text"
                  placeholder="e.g. llama3:8b"
                  className="minimal-input text-xs font-mono"
                  value={newModel.id}
                  onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Provider</span>
                <select
                  className="minimal-select text-xs"
                  style={{ background: "var(--background)", color: "var(--foreground)" }}
                  value={newModel.provider}
                  onChange={(e) => setNewModel(prev => ({ ...prev, provider: e.target.value }))}
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama</option>
                  <option value="lmstudio">LM Studio</option>
                  <option value="custom">Custom Gateway</option>
                </select>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Context Length</span>
                <input
                  type="number"
                  placeholder="128000"
                  className="minimal-input text-xs"
                  value={newModel.contextLength || ""}
                  onChange={(e) => setNewModel(prev => ({ ...prev, contextLength: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Max Output Tokens</span>
                <input
                  type="number"
                  placeholder="4096"
                  className="minimal-input text-xs"
                  value={newModel.maxOutputTokens || ""}
                  onChange={(e) => setNewModel(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) || undefined }))}
                />
              </div>
            </div>

            <button
              onClick={handleAddModel}
              className="custom-btn custom-btn-accent text-xs font-mono py-2 px-4 mt-4"
            >
              + Add Model Profile
            </button>
          </div>
        </div>

        {/* Model List */}
        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <label className="row-label mb-2 block">Active Registry</label>
            <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
              {customModels.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 font-sans">No custom models registered.</div>
              ) : (
                customModels.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-3">
                    <div>
                      <div className="font-bold text-white text-[12px]">{m.name}</div>
                      <div className="text-zinc-500 text-[10px] mt-0.5">
                        ID: {m.id} | Provider: {m.provider.toUpperCase()} | Context: {m.contextLength?.toLocaleString() || "N/A"} | Max Out: {m.maxOutputTokens || "N/A"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveModel(m.id)}
                      className="text-zinc-500 hover:text-rose-500 font-mono text-[9px] uppercase border border-zinc-800 hover:border-rose-500 px-2 py-1 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
