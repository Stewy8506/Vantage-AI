"use client";

import { useState } from "react";
import { Cpu, RefreshCw, X, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
}

interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  openrouter: string;
  ollamaUrl: string;
  lmStudioUrl: string;
  customBaseUrl: string;
  customApiKey: string;
}

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini" },
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "ollama", name: "Ollama (Local)" },
  { id: "lmstudio", name: "LM Studio (Local)" },
  { id: "custom", name: "Custom OpenAI Endpoint" },
];

export default function AgentPlayground({
  agents,
  apiKeys,
  onUpdateAgents,
  onResetAgents,
}: {
  agents: Agent[];
  apiKeys: ApiKeys;
  onUpdateAgents: (agents: Agent[]) => void;
  onResetAgents: () => void;
}) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Load models dynamically when provider is changed in the editor
  const loadModels = async (provider: string) => {
    setLoadingModels(true);
    setModels([]);
    let apiKey = "";
    let customUrl = "";

    if (provider === "gemini") apiKey = apiKeys.gemini;
    if (provider === "openai") apiKey = apiKeys.openai;
    if (provider === "anthropic") apiKey = apiKeys.anthropic;
    if (provider === "openrouter") apiKey = apiKeys.openrouter;
    if (provider === "ollama") customUrl = apiKeys.ollamaUrl || "http://localhost:11434";
    if (provider === "lmstudio") customUrl = apiKeys.lmStudioUrl || "http://localhost:1234";
    if (provider === "custom") {
      customUrl = apiKeys.customBaseUrl;
      apiKey = apiKeys.customApiKey;
    }

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, customUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.models) {
        setModels(data.models);
      }
    } catch (e) {
      console.error("Failed to load models dynamically:", e);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent({ ...agent });
    loadModels(agent.provider);
  };

  const handleSaveAgent = () => {
    if (!editingAgent) return;
    const updated = agents.map((a) => (a.id === editingAgent.id ? editingAgent : a));
    onUpdateAgents(updated);
    setEditingAgent(null);
  };

  return (
    <div className="anim-fade-up max-w-6xl mx-auto flex flex-col gap-6" style={{ paddingBottom: "40px" }}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em" }} className="text-white">Agent Playground</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)" }}>
            Configure and refine the models, system instructions, and temperature metrics for each of the copywriter agents.
          </p>
        </div>
        <button
          className="custom-btn custom-btn-secondary flex items-center gap-2"
          onClick={() => {
            if (confirm("Are you sure you want to reset all agent configurations to defaults? This will overwrite your current configurations.")) {
              onResetAgents();
            }
          }}
          style={{ padding: "8px 16px", fontSize: "0.8rem" }}
        >
          <RefreshCw size={12} className="text-rose-500 animate-spin-hover" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: editingAgent ? "1.2fr 1fr" : "1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Side: Agents List */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col border border-zinc-800 rounded-lg divide-y divide-zinc-800 bg-[#09090b]/40 backdrop-blur-md">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-5 transition-all hover:bg-white/[0.02] flex-wrap md:flex-nowrap gap-4">
                <div className="flex flex-col gap-1 pr-6" style={{ flex: 1 }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "white" }} className="font-heading">{agent.name}</span>
                    <span className="custom-badge custom-badge-accent">{agent.provider.toUpperCase()} • {agent.model}</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--zinc-400)", marginTop: "6px", lineHeight: 1.5 }} className="line-clamp-2 italic">
                    "{agent.systemPrompt}"
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="custom-badge" style={{ fontSize: "0.65rem", padding: "4px 8px" }}>ALWAYS ACTIVE</span>
                  <button className="custom-btn custom-btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem" }} onClick={() => handleEditAgent(agent)}>
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Edit Panel (Drawer Mode with Transitions) */}
        <AnimatePresence>
          {editingAgent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="glass-panel p-6 flex flex-col gap-5 sticky"
              style={{ top: "100px", zIndex: 10 }}
            >
              <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }} className="text-white">
                  <Sliders size={16} className="text-rose-500" />
                  Configure Specialist Agent
                </h3>
                <button
                  style={{ background: "none", border: "none", color: "var(--zinc-500)", cursor: "pointer" }}
                  className="hover:text-white transition-colors"
                  onClick={() => setEditingAgent(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Agent Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <select
                    className="form-input"
                    style={{ background: "#050508" }}
                    value={editingAgent.provider}
                    onChange={(e) => {
                      setEditingAgent({ ...editingAgent, provider: e.target.value });
                      loadModels(e.target.value);
                    }}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id} style={{ background: "#050508" }}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label flex justify-between items-center">
                    <span>Model Name</span>
                    {loadingModels && <RefreshCw size={12} className="animate-spin text-rose-500" />}
                  </label>
                  
                  {loadingModels ? (
                    <div className="shimmer form-input h-10 w-full rounded-lg" style={{ opacity: 0.8 }} />
                  ) : models.length > 0 ? (
                    <select
                      className="form-input"
                      style={{ background: "#050508" }}
                      value={editingAgent.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                    >
                      {models.map((m) => (
                        <option key={m} value={m} style={{ background: "#050508" }}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. gpt-4o-mini"
                      value={editingAgent.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">System Persona Prompt</label>
                  <textarea
                    className="form-input font-mono text-xs"
                    style={{ background: "rgba(5, 5, 8, 0.8)" }}
                    rows={6}
                    value={editingAgent.systemPrompt}
                    onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex justify-between font-mono text-xs text-zinc-400">
                    <span>Creativity Temperature</span>
                    <span className="text-rose-500 font-bold">{editingAgent.temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingAgent.temperature}
                    onChange={(e) => setEditingAgent({ ...editingAgent, temperature: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="flex gap-3 mt-4" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "16px" }}>
                  <button className="custom-btn custom-btn-accent" style={{ flex: 1 }} onClick={handleSaveAgent}>
                    Save Changes
                  </button>
                  <button className="custom-btn custom-btn-secondary" style={{ flex: 1 }} onClick={() => setEditingAgent(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
