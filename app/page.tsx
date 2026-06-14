"use client";

import { useState, useEffect } from "react";
import { Sparkles, Key, Sliders, Activity, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    scores?: {
      hookStrength: number;
      readability: number;
      credibility: number;
      viralPotential: number;
    };
    score?: number; // legacy
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
  serpapi: string;
}

interface ArchivedPost {
  id: string;
  timestamp: string;
  appName: string;
  description: string;
  targetAudience: string;
  tone: string;
  result: GenerationResult;
  performance?: {
    impressions: number;
    likes: number;
    comments: number;
  };
}

interface GenerationCompletePayload extends GenerationResult {
  appName?: string;
  description?: string;
  targetAudience?: string;
  tone?: string;
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent-alpha",
    name: "Agent Alpha (Hook & Structure)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Alpha, a LinkedIn growth expert specializing in scroll-stopping pattern-interrupt hooks, crisp visual spacing, compelling readability formatting, and polarizing engagement triggers. Your goal is to maximize CTR. Always end the post EXACTLY with a hot take formatted as: 'Hot take: [Controversial opinion relevant to project]. Agree or disagree?'. DO NOT use marketing fluff like 'digital abyss'. Start EXACTLY mid-thought with relatable fears of the target audience. Keep the total post under 1200 characters.",
    temperature: 0.8,
    enabled: true,
  },
  {
    id: "agent-beta",
    name: "Agent Beta (Analytical & Metrics)",
    provider: "openai",
    model: "gpt-4o-mini",
    systemPrompt: "You are Agent Beta, a LinkedIn strategist specializing in actionable frameworks, checklist delivery, bold numbers, and direct step-by-step value. Avoid corporate fluff. CRITICAL: Use emoji bullets for all line-by-line breakdowns/feature presentations to draw attention to them. Do not write long product spec sheets or abstract filler. Use 'We built' instead of 'I built'. Use hardcoded/verifiable benchmarks from the description and MUST include a bridging sentence before the metrics. Anchor claims with a clear visual proof placeholder callout. DO NOT use marketing phrases like 'game-changer'. Keep the total post under 1200 characters.",
    temperature: 0.3,
    enabled: true,
  },
  {
    id: "agent-gamma",
    name: "Agent Gamma (Narrative & Story)",
    provider: "gemini",
    model: "gemini-2.5-flash",
    systemPrompt: "You are Agent Gamma, a personal branding ghostwriter specializing in the hero's journey, authenticity, lessons learned, and vulnerability. Your goal is to build organic trust. Ground stories in real professional friction and daily pain. Talk directly to the audience, NOT like a marketer. Do not use phrases like 'digital abyss'. Use 'We built' instead of 'I built' to imply team credibility. Ban abstract filler. Keep the total post under 1200 characters so the best content isn't buried past the 'see more' fold.",
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
  serpapi: "",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"workspace" | "agents" | "settings">("workspace");
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vm_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [customCss, setCustomCss] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("custom_css") || "";
    }
    return "";
  });

  const [editorFormData, setEditorFormData] = useState({
    appName: "",
    description: "",
    targetAudience: "",
    tone: "Professional, punchy, engaging",
    hookArchetype: "organic",
  });

  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    if (typeof window !== "undefined") {
      const keysData = localStorage.getItem("vm_api_keys");
      if (keysData) {
        try { return JSON.parse(keysData); } catch {}
      }
    }
    return DEFAULT_KEYS;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    if (typeof window !== "undefined") {
      const agentsData = localStorage.getItem("vm_agents_config");
      if (agentsData) {
        try {
          const parsed = JSON.parse(agentsData);
          // Auto migration for custom agents database logic
          if (Array.isArray(parsed) && parsed.length >= 3) {
            return parsed;
          }
        } catch {}
      }
    }
    return DEFAULT_AGENTS;
  });

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  const [archive, setArchive] = useState<ArchivedPost[]>(() => {
    if (typeof window !== "undefined") {
      const archiveData = localStorage.getItem("vm_post_archive");
      if (archiveData) {
        try { return JSON.parse(archiveData); } catch {}
      }
    }
    return [];
  });

  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);

  const [editingPerformanceId, setEditingPerformanceId] = useState<string | null>(null);
  const [impressions, setImpressions] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("vm_agents_config")) {
        localStorage.setItem("vm_agents_config", JSON.stringify(DEFAULT_AGENTS));
      }
    }
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("vm_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Keyboard shortcut listener to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveCustomCss = (css: string) => {
    setCustomCss(css);
    localStorage.setItem("custom_css", css);
    const styleEl = document.getElementById("custom-css-overrides");
    if (styleEl) {
      styleEl.innerHTML = css;
    }
  };

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

  const handleGenerateComplete = (data: GenerationCompletePayload) => {
    setResult(data);
    const newArchivedItem = {
      id: `arch-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      appName: data.appName || "LinkedIn Post",
      description: data.description || "",
      targetAudience: data.targetAudience || "",
      tone: data.tone || "",
      result: data as GenerationResult
    };
    setArchive(prev => {
      const updated = [newArchivedItem, ...prev];
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      return updated;
    });
    setSelectedArchiveId(newArchivedItem.id);
  };

  const handleDeleteArchive = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this publication record?")) return;
    setArchive(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      if (selectedArchiveId === id) {
        setSelectedArchiveId(null);
        setResult(null);
      }
      return updated;
    });
  };

  const handleSavePerformance = (id: string, perfData: { impressions: number; likes: number; comments: number }) => {
    setArchive(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, performance: perfData } : item);
      localStorage.setItem("vm_post_archive", JSON.stringify(updated));
      return updated;
    });
  };

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: "var(--background)" }}>
        <Activity className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  return (
    <div className="dashboard-layout">
      {/* Dynamic Style Injection element */}
      <style id="custom-css-overrides-runtime" dangerouslySetInnerHTML={{ __html: customCss }} />

      {/* Collapsible Sidebar edge pane */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          
          {/* Header & toggle menu */}
          <div className="flex items-center justify-between w-full sidebar-header-container">
            <div className="brand-text">
              <Sparkles size={18} className="text-zinc-300 animate-pulse" />
              <span>
                Virality <span className="font-normal font-sans italic">Mapper</span>
              </span>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 hover:bg-zinc-800/40 rounded border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center justify-center"
              title="Toggle Sidebar (Ctrl + \)"
              style={{ background: "none" }}
            >
              <Sliders size={14} />
            </button>
          </div>

          {/* New publication trigger */}
          <button
            className="custom-btn custom-btn-accent w-full flex items-center gap-2 new-pub-btn"
            onClick={() => {
              setSelectedArchiveId(null);
              setResult(null);
              setActiveTab("workspace");
            }}
            style={{ padding: "10px 16px", fontSize: "0.8rem", borderRadius: "6px" }}
          >
            <Sparkles size={13} />
            <span>New Publication</span>
          </button>

          {/* Main navigation links */}
          <nav>
            <div
              className={`nav-item ${activeTab === "workspace" && !selectedArchiveId ? "active" : ""}`}
              onClick={() => {
                setSelectedArchiveId(null);
                setResult(null);
                setActiveTab("workspace");
              }}
            >
              <Sparkles size={16} />
              <span>Workspace</span>
            </div>
            <div
              className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
              onClick={() => setActiveTab("agents")}
            >
              <Sliders size={16} />
              <span>Specialist Agents</span>
            </div>
            <div
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Key size={16} />
              <span>Customizations</span>
            </div>
          </nav>

          {/* Historical Saved Publications integrated (OpenWebUI chat-style list) */}
          <div className="flex flex-col gap-2 flex-1 overflow-hidden sidebar-archive-list" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "16px" }}>
            <div className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider mb-1 px-2 flex items-center justify-between">
              <span>Saved History</span>
              {archive.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">{archive.length}</span>}
            </div>
            {archive.length === 0 ? (
              <div className="text-[10px] text-zinc-500 italic px-2 py-3 leading-normal">
                No publications saved yet. Generate a post to start building your archive.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1">
                {archive.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedArchiveId(item.id);
                      setResult(item.result);
                      setActiveTab("workspace");
                    }}
                    className="p-2.5 rounded border text-left cursor-pointer transition-all hover:bg-zinc-800/20"
                    style={{
                      borderColor: selectedArchiveId === item.id ? "var(--border-active)" : "transparent",
                      background: selectedArchiveId === item.id ? "var(--accent-glow)" : "transparent",
                      fontSize: "0.78rem"
                    }}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-white truncate max-w-[130px]">{item.appName}</span>
                      <span className="text-[9px] text-zinc-500 font-mono flex-shrink-0">{item.timestamp.split(",")[0]}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5" style={{ margin: 0 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info/Stats Widget */}
        <div className="sidebar-footer-widget p-3 border border-zinc-800 rounded-lg flex flex-col gap-2 background-zinc-900/40 backdrop-blur-md" style={{ background: "var(--background)" }}>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Specialist Pool:</span>
            <span style={{ color: activeAgentsCount === 3 ? "var(--foreground)" : "var(--zinc-500)", fontWeight: 700 }}>
              {activeAgentsCount} / 3 selected
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Engine mode:</span>
            <span className="text-white font-bold text-[10px] uppercase font-mono">
              Debate Settle
            </span>
          </div>
        </div>
      </aside>

      {/* Main dashboard console workspace */}
      <main className="main-content">
        <header style={{ borderBottom: "1px solid var(--border-muted)", padding: "20px 32px", background: "var(--background)", position: "sticky", top: 0, zIndex: 30 }}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <h1 style={{ fontSize: "1.25rem", fontWeight: 500 }} className="tracking-tight text-white font-heading">
              {activeTab === "workspace" && (selectedArchiveId ? "Publication Review Pane" : "Debate Console")}
              {activeTab === "agents" && "Agents Playground"}
              {activeTab === "settings" && "Style & Credential Manager"}
            </h1>
            <div className="status-bar">
              <span className="status-dot"></span>
              <span>Debate Engine V3</span>
            </div>
          </div>
        </header>

        <div className="container">
          <AnimatePresence mode="wait">
            {activeTab === "workspace" && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full flex flex-col gap-6"
              >
                {selectedArchiveId ? (
                  /* Consolidated integrated historical post results viewer */
                  (() => {
                    const selectedItem = archive.find(item => item.id === selectedArchiveId);
                    if (!selectedItem) {
                      return (
                        <div className="glass-panel p-8 text-center text-zinc-500 text-xs">
                          Publication record not found.
                        </div>
                      );
                    }
                    return (
                      <>
                        <div className="glass-panel p-4 flex flex-col gap-3" style={{ background: "var(--panel-bg)" }}>
                          <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "8px" }}>
                            <div className="flex items-center gap-2">
                              <Sparkles size={13} className="text-zinc-500" />
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--zinc-400)" }}>Original Prompt Context</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditorFormData({
                                  appName: selectedItem.appName,
                                  description: selectedItem.description,
                                  targetAudience: selectedItem.targetAudience,
                                  tone: selectedItem.tone,
                                  hookArchetype: selectedItem.result?.best?.style || "organic",
                                });
                                setSelectedArchiveId(null);
                                setResult(null);
                              }}
                              className="custom-btn custom-btn-secondary text-[10px] h-7 px-3 flex items-center justify-center cursor-pointer font-bold"
                            >
                              Clone parameters to Editor
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div><strong className="text-zinc-500">AppName:</strong> <span className="text-zinc-300">{selectedItem.appName}</span></div>
                            <div><strong className="text-zinc-500">Tone:</strong> <span className="text-zinc-300">{selectedItem.tone || "General"}</span></div>
                            <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500">Description:</strong> <span className="text-zinc-400 line-clamp-3">{selectedItem.description}</span></div>
                            <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500">Target Audience:</strong> <span className="text-zinc-300">{selectedItem.targetAudience || "General Professionals"}</span></div>
                          </div>

                          {/* Performance metrics dashboard inline */}
                          <div style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "12px", marginTop: "4px" }}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-1.5 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider font-mono">
                                <TrendingUp size={12} className="text-zinc-400 animate-pulse" />
                                <span>Self-Published Analytics (Feedback Loop)</span>
                              </div>
                              {!selectedItem.performance && editingPerformanceId !== selectedItem.id && (
                                <button
                                  onClick={() => {
                                    setEditingPerformanceId(selectedItem.id);
                                    setImpressions(0);
                                    setLikes(0);
                                    setComments(0);
                                  }}
                                  className="text-[10px] text-zinc-400 font-semibold cursor-pointer hover:underline border-0 bg-transparent"
                                >
                                  + Record Actual Metrics
                                </button>
                              )}
                            </div>

                            {editingPerformanceId === selectedItem.id ? (
                              <div className="flex flex-wrap gap-3 items-end p-3 rounded border" style={{ background: "var(--background)", borderColor: "var(--border-muted)" }}>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                  <span>Impressions</span>
                                  <input
                                    type="number"
                                    className="form-input text-xs w-24 h-7 p-1"
                                    style={{ background: "var(--panel-bg)", borderColor: "var(--border-muted)" }}
                                    value={impressions}
                                    onChange={(e) => setImpressions(Number(e.target.value))}
                                  />
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                  <span>Likes</span>
                                  <input
                                    type="number"
                                    className="form-input text-xs w-24 h-7 p-1"
                                    style={{ background: "var(--panel-bg)", borderColor: "var(--border-muted)" }}
                                    value={likes}
                                    onChange={(e) => setLikes(Number(e.target.value))}
                                  />
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
                                  <span>Comments</span>
                                  <input
                                    type="number"
                                    className="form-input text-xs w-24 h-7 p-1"
                                    style={{ background: "var(--panel-bg)", borderColor: "var(--border-muted)" }}
                                    value={comments}
                                    onChange={(e) => setComments(Number(e.target.value))}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      handleSavePerformance(selectedItem.id, { impressions, likes, comments });
                                      setEditingPerformanceId(null);
                                    }}
                                    className="custom-btn custom-btn-accent text-[10px] h-7 px-3 flex items-center justify-center cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingPerformanceId(null)}
                                    className="custom-btn custom-btn-secondary text-[10px] h-7 px-3 flex items-center justify-center cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : selectedItem.performance ? (
                              <div className="flex items-center gap-4 justify-between bg-zinc-900/30 border border-zinc-800/40 p-2.5 rounded text-xs font-mono text-zinc-300">
                                <div className="flex gap-4">
                                  <div><span className="text-zinc-500">Impressions:</span> {selectedItem.performance!.impressions.toLocaleString()}</div>
                                  <div><span className="text-zinc-500">Likes:</span> {selectedItem.performance!.likes.toLocaleString()}</div>
                                  <div><span className="text-zinc-500">Comments:</span> {selectedItem.performance!.comments.toLocaleString()}</div>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setEditingPerformanceId(selectedItem.id);
                                      setImpressions(selectedItem.performance!.impressions);
                                      setLikes(selectedItem.performance!.likes);
                                      setComments(selectedItem.performance!.comments);
                                    }}
                                    className="text-[10px] text-zinc-500 hover:text-white cursor-pointer border-0 bg-transparent"
                                  >
                                    [Edit]
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArchive(selectedItem.id)}
                                    className="text-[10px] text-rose-400 hover:underline cursor-pointer border-0 bg-transparent font-bold"
                                  >
                                    [Delete]
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono italic">
                                <span>No performance metrics recorded for this publication yet. Record them once published to feed the self-improving RAG database.</span>
                                <button
                                  onClick={() => handleDeleteArchive(selectedItem.id)}
                                  className="text-[10px] text-rose-400 hover:underline cursor-pointer border-0 bg-transparent font-bold"
                                >
                                  [Delete Publication]
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <ResultsDisplay result={selectedItem.result} />
                      </>
                    );
                  })()
                ) : (
                  /* Editor Panel for active generations */
                  <>
                    <PostGeneratorForm
                      agents={agents}
                      apiKeys={apiKeys}
                      onGenerate={handleGenerateComplete}
                      onStartGenerate={() => setResult(null)}
                      onToggleAgent={handleToggleAgent}
                      formData={editorFormData}
                      setFormData={setEditorFormData}
                    />
                    {result && <ResultsDisplay result={result} />}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <AgentPlayground
                  agents={agents}
                  apiKeys={apiKeys}
                  onUpdateAgents={updateAgents}
                  onResetAgents={() => {
                    updateAgents(DEFAULT_AGENTS);
                  }}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <SettingsTab
                  apiKeys={apiKeys}
                  onSave={updateApiKeys}
                  customCss={customCss}
                  onSaveCustomCss={handleSaveCustomCss}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
