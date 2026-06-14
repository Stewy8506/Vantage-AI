"use client";

import { useState, useEffect } from "react";
import { Cpu, Plus, Edit2, Trash2, Check, RefreshCw, X, Sliders, Play, AlertCircle } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
}

interface JudgeConfig {
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
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
  judgeConfig,
  apiKeys,
  onUpdateAgents,
  onUpdateJudge,
}: {
  agents: Agent[];
  judgeConfig: JudgeConfig;
  apiKeys: ApiKeys;
  onUpdateAgents: (agents: Agent[]) => void;
  onUpdateJudge: (judge: JudgeConfig) => void;
}) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isEditingJudge, setIsEditingJudge] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [tempJudge, setTempJudge] = useState<JudgeConfig>(judgeConfig);

  // Sync state with prop updates
  useEffect(() => {
    setTempJudge(judgeConfig);
  }, [judgeConfig]);

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
    setIsEditingJudge(false);
    loadModels(agent.provider);
  };

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: Math.random().toString(36).substring(7),
      name: "New Creator Agent",
      provider: "gemini",
      model: "gemini-2.5-flash",
      systemPrompt: "You are a specialized ghostwriter. Focus on building hooks and clear formatting.",
      temperature: 0.7,
      enabled: true,
    };
    setEditingAgent(newAgent);
    setIsEditingJudge(false);
    loadModels("gemini");
  };

  const handleSaveAgent = () => {
    if (!editingAgent) return;
    const exists = agents.some((a) => a.id === editingAgent.id);
    let updated;
    if (exists) {
      updated = agents.map((a) => (a.id === editingAgent.id ? editingAgent : a));
    } else {
      updated = [...agents, editingAgent];
    }
    onUpdateAgents(updated);
    setEditingAgent(null);
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm("Are you sure you want to remove this agent?")) {
      const updated = agents.filter((a) => a.id !== id);
      onUpdateAgents(updated);
      if (editingAgent?.id === id) {
        setEditingAgent(null);
      }
    }
  };

  const handleToggleAgent = (id: string) => {
    const updated = agents.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    onUpdateAgents(updated);
  };

  const handleSaveJudge = () => {
    onUpdateJudge(tempJudge);
    setIsEditingJudge(false);
  };

  return (
    <div className="anim-fade-up max-w-6xl mx-auto flex flex-col gap-6" style={{ paddingBottom: "40px" }}>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Agent Playground</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)" }}>
            Customize your writing agents, change their prompts, temperatures, and models.
          </p>
        </div>
        <button className="custom-btn custom-btn-accent" onClick={handleCreateAgent}>
          <Plus size={16} /> Create Agent
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: editingAgent || isEditingJudge ? "1.2fr 1fr" : "1fr", gap: "24px" }}>
        
        {/* Left Side: Agents List */}
        <div className="flex flex-col gap-4">
          {/* Master Judge Configuration summary */}
          <div className="p-5 flex items-center justify-between border border-dashed border-zinc-800 rounded-lg bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
              <div className="flow-step-icon active" style={{ width: "32px", height: "32px" }}>
                <Cpu size={14} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Master Judge Consensus Agent</span>
                <span style={{ fontSize: "0.75rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  {tempJudge.provider.toUpperCase()} / {tempJudge.model}
                </span>
              </div>
            </div>
            <button className="custom-btn custom-btn-secondary" style={{ padding: "8px 14px", fontSize: "0.75rem" }} onClick={() => { setIsEditingJudge(true); setEditingAgent(null); loadModels(tempJudge.provider); }}>
              Configure Judge
            </button>
          </div>

          <div className="flex flex-col border border-zinc-800 rounded-lg divide-y divide-zinc-800 bg-[#0a0a0a]">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-5 transition-opacity" style={{ opacity: agent.enabled ? 1 : 0.65 }}>
                <div className="flex flex-col gap-1 pr-6" style={{ flex: 1 }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "white" }}>{agent.name}</span>
                    <span className="custom-badge">{agent.provider.toUpperCase()} • {agent.model}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--zinc-400)", marginTop: "4px", lineHeight: 1.4 }}>
                    {agent.systemPrompt}
                  </p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <label className="switch">
                    <input type="checkbox" checked={agent.enabled} onChange={() => handleToggleAgent(agent.id)} />
                    <span className="slider"></span>
                  </label>
                  <div className="flex gap-2">
                    <button className="custom-btn custom-btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => handleEditAgent(agent)}>
                      Configure
                    </button>
                    <button className="custom-btn custom-btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem", borderColor: "rgba(239, 68, 68, 0.2)", color: "#fca5a5" }} onClick={() => handleDeleteAgent(agent.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {agents.filter((a) => a.enabled).length < 2 && (
            <div className="glass-panel p-4 flex items-center gap-3" style={{ background: "rgba(239, 68, 68, 0.03)", borderColor: "rgba(239, 68, 68, 0.15)" }}>
              <AlertCircle size={16} style={{ color: "var(--accent)" }} />
              <p style={{ fontSize: "0.8rem", color: "var(--zinc-400)" }}>
                You must enable at least <strong>2 agents</strong> to evaluate posts via the multi-agent consensus workflow.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Edit Panel (Drawer Mode) */}
        {(editingAgent || isEditingJudge) && (
          <div className="glass-panel p-6 flex flex-col gap-5 anim-fade-up" style={{ alignSelf: "start", position: "sticky", top: "20px" }}>
            <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={16} style={{ color: "var(--accent)" }} />
                {isEditingJudge ? "Configure Judge" : "Edit Agent Person"}
              </h3>
              <button style={{ background: "none", border: "none", color: "var(--zinc-500)", cursor: "pointer" }} onClick={() => { setEditingAgent(null); setIsEditingJudge(false); }}>
                <X size={18} />
              </button>
            </div>

            {isEditingJudge ? (
              /* Judge Editor Form */
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <select
                    className="form-input"
                    value={tempJudge.provider}
                    onChange={(e) => {
                      setTempJudge({ ...tempJudge, provider: e.target.value });
                      loadModels(e.target.value);
                    }}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label flex justify-between items-center">
                    <span>Model Name</span>
                    {loadingModels && <RefreshCw size={12} className="animate-spin" />}
                  </label>
                  {models.length > 0 ? (
                    <select
                      className="form-input"
                      value={tempJudge.model}
                      onChange={(e) => setTempJudge({ ...tempJudge, model: e.target.value })}
                    >
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. gemini-2.5-flash"
                      value={tempJudge.model}
                      onChange={(e) => setTempJudge({ ...tempJudge, model: e.target.value })}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">System Synthesis Instructions</label>
                  <textarea
                    className="form-input"
                    rows={6}
                    value={tempJudge.systemPrompt}
                    onChange={(e) => setTempJudge({ ...tempJudge, systemPrompt: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex justify-between">
                    <span>Temperature</span>
                    <span>{tempJudge.temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempJudge.temperature}
                    onChange={(e) => setTempJudge({ ...tempJudge, temperature: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button className="custom-btn custom-btn-accent" style={{ flex: 1 }} onClick={handleSaveJudge}>
                    Save Judge
                  </button>
                  <button className="custom-btn custom-btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditingJudge(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Individual Agent Editor Form */
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Agent Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingAgent!.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent!, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <select
                    className="form-input"
                    value={editingAgent!.provider}
                    onChange={(e) => {
                      setEditingAgent({ ...editingAgent!, provider: e.target.value });
                      loadModels(e.target.value);
                    }}
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label flex justify-between items-center">
                    <span>Model Name</span>
                    {loadingModels && <RefreshCw size={12} className="animate-spin" />}
                  </label>
                  {models.length > 0 ? (
                    <select
                      className="form-input"
                      value={editingAgent!.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent!, model: e.target.value })}
                    >
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. gpt-4o-mini"
                      value={editingAgent!.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent!, model: e.target.value })}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">System Persona Prompt</label>
                  <textarea
                    className="form-input"
                    rows={6}
                    value={editingAgent!.systemPrompt}
                    onChange={(e) => setEditingAgent({ ...editingAgent!, systemPrompt: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex justify-between">
                    <span>Temperature</span>
                    <span>{editingAgent!.temperature}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingAgent!.temperature}
                    onChange={(e) => setEditingAgent({ ...editingAgent!, temperature: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button className="custom-btn custom-btn-accent" style={{ flex: 1 }} onClick={handleSaveAgent}>
                    Save Agent
                  </button>
                  <button className="custom-btn custom-btn-secondary" style={{ flex: 1 }} onClick={() => setEditingAgent(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
