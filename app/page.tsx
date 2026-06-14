"use client";

import { useState, useEffect } from "react";
import { Sparkles, Cpu, Key, Sliders, Globe, Activity } from "lucide-react";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import AgentPlayground from "@/components/AgentPlayground";
import SettingsTab from "@/components/SettingsTab";

interface GenerationResult {
  trends: string[];
  initialDrafts: Array<{
    name: string;
    content: string;
    hookExplanation: string;
    provider: string;
    model: string;
  }>;
  critiques: Array<{
    from: string;
    to: string;
    content: string;
    score: number;
  }>;
  refinedDrafts: Array<{
    name: string;
    content: string;
    score: number;
    argument: string;
    provider: string;
    model: string;
  }>;
  best: {
    style: string;
    content: string;
    score: number;
    critique: string;
  };
}

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

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-alpha",
    name: "Agent Alpha (Hook & Structure)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Alpha, a LinkedIn growth expert specializing in scroll-stopping pattern-interrupt hooks, crisp visual spacing, and compelling readability formatting. Your goal is to maximize CTR (Click-Through Rate).",
    temperature: 0.8,
    enabled: true,
  },
  {
    id: "agent-beta",
    name: "Agent Beta (Analytical & Metrics)",
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: "You are Agent Beta, a LinkedIn strategist specializing in actionable frameworks, checklist delivery, bold numbers, clear business metrics, and direct step-by-step value. Avoid any corporate fluff.",
    temperature: 0.3,
    enabled: true,
  },
  {
    id: "agent-gamma",
    name: "Agent Gamma (Narrative & Story)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Gamma, a personal branding ghostwriter specializing in the hero's journey, authenticity, lessons learned, and vulnerability. Your goal is to build long-term trust and organic connection.",
    temperature: 0.85,
    enabled: true,
  },
];

const DEFAULT_KEYS: ApiKeys = {
  gemini: "",
  openai: "",
  anthropic: "",
  openrouter: "",
  ollamaUrl: "http://localhost:11434",
  lmStudioUrl: "http://localhost:1234",
  customBaseUrl: "",
  customApiKey: "",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"workspace" | "agents" | "settings">("workspace");
  const [apiKeys, setApiKeys] = useState<ApiKeys>(DEFAULT_KEYS);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    const keysData = localStorage.getItem("vm_api_keys");
    const agentsData = localStorage.getItem("vm_agents_config");

    if (keysData) {
      try { setApiKeys(JSON.parse(keysData)); } catch (e) {}
    }
    
    let loadedAgents = DEFAULT_AGENTS;
    if (agentsData) {
      try {
        const parsed = JSON.parse(agentsData);
        const hasOldAgents = parsed.some((a: any) => 
          a.id === "storytelling-ghost" || 
          a.id === "analytical-growth" || 
          a.id === "contrarian-tech-rebel"
        );
        if (parsed.length === 3 && !hasOldAgents) {
          loadedAgents = parsed;
        } else {
          localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
        }
      } catch (e) {
        localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
      }
    } else {
      localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
    }
    setAgents(loadedAgents);
    setLoaded(true);
  }, []);

  const updateApiKeys = (newKeys: ApiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem("vm_api_keys", JSON.stringify(newKeys));
  };

  const updateAgents = (newAgents: Agent[]) => {
    setAgents(newAgents);
    localStorage.setItem("vm_agents_config", JSON.stringify(newAgents));
  };

  const handleToggleAgent = (id: string) => {
    const updated = agents.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    updateAgents(updated);
  };

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050508]">
        <Activity className="animate-spin text-rose-500" size={32} />
      </div>
    );
  }

  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  return (
    <div className="dashboard-layout">
      {/* 3-Panel: Panel 1 - Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-text">
          <Sparkles size={16} style={{ color: "white" }} />
          <span>
            Virality <span className="serif-italic" style={{ color: "white" }}>Mapper</span>
          </span>
        </div>

        <nav style={{ flex: 1, marginTop: "24px" }}>
          <div
            className={`nav-item ${activeTab === "workspace" ? "active" : ""}`}
            onClick={() => setActiveTab("workspace")}
          >
            <Sparkles size={14} />
            <span>Workspace</span>
          </div>
          <div
            className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
            onClick={() => setActiveTab("agents")}
          >
            <Sliders size={14} />
            <span>Agent Playground</span>
          </div>
          <div
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Key size={14} />
            <span>Settings</span>
          </div>
        </nav>

        {/* Sidebar Info/Stats Widget */}
        <div className="p-4 border border-zinc-800 rounded-lg flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Activity size={11} />
            <span>Active Status</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Enabled Agents:</span>
            <span style={{ color: activeAgentsCount >= 2 ? "white" : "var(--zinc-500)", fontWeight: 600 }}>
              {activeAgentsCount} / 3
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Debate Mode:</span>
            <span style={{ color: "white", fontWeight: 600 }}>
              Bidirectional
            </span>
          </div>
        </div>
      </aside>

      {/* 3-Panel: Panel 2 - Content Dashboard */}
      <main className="main-content">
        <header style={{ borderBottom: "1px solid var(--panel-border)", padding: "16px 32px", background: "rgba(5, 5, 8, 0.8)", position: "sticky", top: 0, zIndex: 10 }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              {activeTab === "workspace" && "Writing Console"}
              {activeTab === "agents" && "Agent Customizer"}
              {activeTab === "settings" && "Credentials Manager"}
            </h1>
            <div className="status-bar" style={{ margin: 0, padding: "4px 10px" }}>
              <span className="status-dot"></span>
              <span>Debate Engine V3</span>
            </div>
          </div>
        </header>

        <div className="container" style={{ padding: "32px 32px 48px", overflowY: "auto" }}>
          {activeTab === "workspace" && (
            <div className="flex flex-col gap-6">
              <PostGeneratorForm
                agents={agents}
                apiKeys={apiKeys}
                onGenerate={(data) => setResult(data)}
                onToggleAgent={handleToggleAgent}
              />
              {result && <ResultsDisplay result={result} />}
            </div>
          )}

          {activeTab === "agents" && (
            <AgentPlayground
              agents={agents}
              apiKeys={apiKeys}
              onUpdateAgents={updateAgents}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              apiKeys={apiKeys}
              onSave={updateApiKeys}
            />
          )}
        </div>
      </main>
    </div>
  );
}
