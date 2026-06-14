"use client";

import { useState, useEffect } from "react";
import { Sliders, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import AgentPlayground from "@/components/AgentPlayground";
import SettingsModal from "@/components/SettingsModal";
import Sidebar from "@/components/workspace/Sidebar";
import DashboardOverview from "@/components/workspace/DashboardOverview";
import PerformanceAnalytics from "@/components/workspace/PerformanceAnalytics";

interface UserPreferences {
  linkedinName: string;
  linkedinHeadline: string;
  linkedinAvatar: string;
  layoutDensity: "compact" | "cozy" | "spacious";
  sidebarPosition: "left" | "right";
  autoCopyToClipboard: boolean;
  defaultHookArchetype: string;
  fontSize: number;
  enableRAG: boolean;
  customFontUrl?: string;
  customFontFamily?: string;
}

interface CustomModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  maxOutputTokens?: number;
}

interface CustomMetric {
  id: string;
  name: string;
  weight: number;
  scoringInstructions: string;
}

interface CustomPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  commentRatio: number;
}

interface CrawlerConfig {
  enginePriority: string[];
  targetYear: number;
  serpapiEnabled: boolean;
}

interface AdvancedParams {
  temperature: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
  seed: number;
  stopSequences: string;
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

interface MasterConfig {
  version: number;
  apiKeys: ApiKeys;
  preferences: UserPreferences & {
    theme: string;
    font: string;
    showTransitions: boolean;
  };
  agents: Agent[];
  customModels: CustomModel[];
  customMetrics: CustomMetric[];
  customPersonas: CustomPersona[];
  crawlerConfig: CrawlerConfig;
  advancedParams: AdvancedParams;
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

const DEFAULT_CUSTOM_MODELS: CustomModel[] = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini", contextLength: 1048576, maxOutputTokens: 8192 },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", contextLength: 128000, maxOutputTokens: 16384 },
  { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", provider: "anthropic", contextLength: 200000, maxOutputTokens: 8192 }
];

const DEFAULT_CUSTOM_METRICS: CustomMetric[] = [
  { id: "hookStrength", name: "Hook Strength", weight: 25, scoringInstructions: "Evaluate the hook's ability to stop the scroll, disrupt pattern, and appeal to the target audience. Output score 0-100." },
  { id: "readability", name: "Readability", weight: 25, scoringInstructions: "Evaluate formatting, line spacing, sentence structure, and clarity for mobile scrolling. Output score 0-100." },
  { id: "credibility", name: "Credibility", weight: 25, scoringInstructions: "Evaluate the authority, actions, real metrics bridging, and trust factor. Output score 0-100." },
  { id: "viralPotential", name: "Viral Potential", weight: 25, scoringInstructions: "Evaluate shareability, commentary triggers, polar hot take relevance, and CTA effectiveness. Output score 0-100." }
];

const DEFAULT_CUSTOM_PERSONAS: CustomPersona[] = [
  { id: "cto", name: "Skeptical CTO", avatar: "🛡️", description: "Values deep architecture details, concrete benchmarks, security integrity, and zero cloud-lockout egress.", commentRatio: 40 },
  { id: "solopreneur", name: "Hustling Solopreneur", avatar: "⚡", description: "Values speed to build, automation efficiency, direct revenue/business growth, and simple tooling.", commentRatio: 75 },
  { id: "vc", name: "Metrics-Driven VC", avatar: "📈", description: "Values market size disruption, high product velocity metrics, team scale, and competitive moats.", commentRatio: 30 },
  { id: "devadvocate", name: "Developer Advocate", avatar: "💡", description: "Values great developer experience (DX), open-source accessibility, local-first setups, and clear templates.", commentRatio: 60 }
];

const DEFAULT_CRAWLER_CONFIG: CrawlerConfig = {
  enginePriority: ["yahoo", "duckduckgo_lite", "duckduckgo_html"],
  targetYear: 2026,
  serpapiEnabled: true
};

const DEFAULT_ADVANCED_PARAMS: AdvancedParams = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
  seed: 42,
  stopSequences: ""
};

const DEFAULT_MASTER_CONFIG = (legacyKeys: ApiKeys, legacyPrefs: UserPreferences, legacyAgents: Agent[]): MasterConfig => ({
  version: 1,
  apiKeys: legacyKeys,
  preferences: {
    ...legacyPrefs,
    theme: typeof window !== "undefined" ? localStorage.getItem("theme") || "obsidian" : "obsidian",
    font: typeof window !== "undefined" ? localStorage.getItem("font") || "geist" : "geist",
    showTransitions: true
  },
  agents: legacyAgents,
  customModels: DEFAULT_CUSTOM_MODELS,
  customMetrics: DEFAULT_CUSTOM_METRICS,
  customPersonas: DEFAULT_CUSTOM_PERSONAS,
  crawlerConfig: DEFAULT_CRAWLER_CONFIG,
  advancedParams: DEFAULT_ADVANCED_PARAMS
});

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
    scores?: Record<string, number>;
    score?: number; // legacy
    critique: string;
  };
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

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<"workspace" | "new-publication" | "agents">("workspace");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vm_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [masterConfig, setMasterConfig] = useState<MasterConfig>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vm_master_config");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.version === 1) {
            return parsed;
          }
        } catch { }
      }

      // Fallback migration of legacy keys
      let legacyKeys = DEFAULT_KEYS;
      try {
        const storedKeys = localStorage.getItem("vm_api_keys");
        if (storedKeys) legacyKeys = JSON.parse(storedKeys);
      } catch {}

      let legacyPrefs = {
        linkedinName: "AI Copywriter Agent Network",
        linkedinHeadline: "Synthesized via Virality Settle Engine",
        linkedinAvatar: "💡",
        layoutDensity: "cozy" as const,
        sidebarPosition: "left" as const,
        autoCopyToClipboard: false,
        defaultHookArchetype: "organic",
        fontSize: 14,
        enableRAG: true,
      };
      try {
        const storedPrefs = localStorage.getItem("vm_user_preferences");
        if (storedPrefs) legacyPrefs = JSON.parse(storedPrefs);
      } catch {}

      let legacyAgents = DEFAULT_AGENTS;
      try {
        const storedAgents = localStorage.getItem("vm_agents_config");
        if (storedAgents) {
          const parsed = JSON.parse(storedAgents);
          if (Array.isArray(parsed) && parsed.length >= 3) legacyAgents = parsed;
        }
      } catch {}

      const config = DEFAULT_MASTER_CONFIG(legacyKeys, legacyPrefs, legacyAgents);
      localStorage.setItem("vm_master_config", JSON.stringify(config));
      return config;
    }

    return DEFAULT_MASTER_CONFIG(DEFAULT_KEYS, {
      linkedinName: "AI Copywriter Agent Network",
      linkedinHeadline: "Synthesized via Virality Settle Engine",
      linkedinAvatar: "💡",
      layoutDensity: "cozy",
      sidebarPosition: "left",
      autoCopyToClipboard: false,
      defaultHookArchetype: "organic",
      fontSize: 14,
      enableRAG: true,
    }, DEFAULT_AGENTS);
  });

  const apiKeys = masterConfig.apiKeys;
  const preferences = masterConfig.preferences;
  const agents = masterConfig.agents;

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

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [archive, setArchive] = useState<ArchivedPost[]>(() => {
    if (typeof window !== "undefined") {
      const archiveData = localStorage.getItem("vm_post_archive");
      if (archiveData) {
        try { return JSON.parse(archiveData); } catch { }
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

  // Toggle body class for layout density dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.className = `layout-${preferences.layoutDensity}`;
    }
  }, [preferences.layoutDensity]);

  // Load dynamic font stylesheet at runtime
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Remove old dynamic font elements
    const oldLink = document.getElementById("dynamic-custom-font-link");
    if (oldLink) oldLink.remove();

    const font = preferences.font;
    if (font === "fira") {
      const link = document.createElement("link");
      link.id = "dynamic-custom-font-link";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap";
      document.head.appendChild(link);
      document.documentElement.setAttribute("data-font", "fira");
      localStorage.setItem("font", "fira");
    } else if (font === "custom") {
      document.documentElement.setAttribute("data-font", "custom");
      localStorage.setItem("font", "custom");
      if (preferences.customFontUrl && preferences.customFontUrl.startsWith("http")) {
        const link = document.createElement("link");
        link.id = "dynamic-custom-font-link";
        link.rel = "stylesheet";
        link.href = preferences.customFontUrl;
        document.head.appendChild(link);
      }
      if (preferences.customFontFamily) {
        document.documentElement.style.setProperty("--font-custom-family", preferences.customFontFamily);
      } else {
        document.documentElement.style.removeProperty("--font-custom-family");
      }
    } else {
      document.documentElement.setAttribute("data-font", font);
      localStorage.setItem("font", font);
    }
  }, [preferences.font, preferences.customFontUrl, preferences.customFontFamily]);

  const handleSaveCustomCss = (css: string) => {
    setCustomCss(css);
    localStorage.setItem("custom_css", css);
    const styleEl = document.getElementById("custom-css-overrides");
    if (styleEl) {
      styleEl.innerHTML = css;
    }
  };

  const updateAgents = (newAgents: Agent[]) => {
    setMasterConfig(prev => {
      const next = { ...prev, agents: newAgents };
      localStorage.setItem("vm_master_config", JSON.stringify(next));
      return next;
    });
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
        setActiveTab("workspace");
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
    <div className={`dashboard-layout layout-${preferences.layoutDensity} ${preferences.sidebarPosition === "right" ? "sidebar-right" : ""}`}>
      {/* Dynamic Style Injection element */}
      <style id="custom-css-overrides-runtime" dangerouslySetInnerHTML={{ __html: customCss }} />
      <style id="preferences-fontSize-overrides" dangerouslySetInnerHTML={{
        __html: `
        :root {
          font-size: ${preferences.fontSize}px;
        }
      `}} />

      {/* Collapsible Sidebar edge pane */}
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedArchiveId={selectedArchiveId}
        setSelectedArchiveId={setSelectedArchiveId}
        setResult={setResult}
        archive={archive}
        archiveSearch={archiveSearch}
        setArchiveSearch={setArchiveSearch}
        activeAgentsCount={activeAgentsCount}
        preferences={preferences}
        setIsSettingsOpen={setIsSettingsOpen}
      />

      {/* Main dashboard console workspace */}
      <main className="main-content">
        {/* Floating Command Bar inside main canvas */}
        <div className="command-bar animate-fade-up">
          <span className="text-xs text-zinc-500 font-mono font-semibold uppercase tracking-wider">
            {activeTab === "workspace" && (selectedArchiveId ? "Review Pane" : "Workspace Hub")}
            {activeTab === "new-publication" && "Debate Console"}
            {activeTab === "agents" && "Agents Playground"}
          </span>
          <div className="h-4 w-px bg-zinc-800"></div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="sidebar-toggle-btn h-7 w-7"
            title="Configurations"
          >
            <Sliders size={13} />
          </button>
          <div className="status-bar py-1 px-3">
            <span className="status-dot"></span>
            <span className="text-[10px] font-bold">DEBATE V3</span>
          </div>
        </div>

        <div className="container">
          <AnimatePresence mode="wait">
            {activeTab === "workspace" && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full flex flex-col gap-6"
              >
                {selectedArchiveId ? (
                  /* Consolidated integrated historical post results viewer */
                  (() => {
                    const selectedItem = archive.find(item => item.id === selectedArchiveId);
                    if (!selectedItem) {
                      return (
                        <div className="p-8 text-center text-zinc-500 text-xs" style={{ background: "transparent" }}>
                          Publication record not found.
                        </div>
                      );
                    }
                    return (
                      <>
                        <PerformanceAnalytics
                          selectedItem={selectedItem}
                          editingPerformanceId={editingPerformanceId}
                          setEditingPerformanceId={setEditingPerformanceId}
                          impressions={impressions}
                          setImpressions={setImpressions}
                          likes={likes}
                          setLikes={setLikes}
                          comments={comments}
                          setComments={setComments}
                          handleSavePerformance={handleSavePerformance}
                          handleDeleteArchive={handleDeleteArchive}
                          setEditorFormData={setEditorFormData}
                          setSelectedArchiveId={setSelectedArchiveId}
                          setResult={setResult}
                          setActiveTab={setActiveTab}
                        />
                        <ResultsDisplay result={selectedItem.result} preferences={preferences} />
                      </>
                    );
                  })()
                ) : (
                  /* Workspace Dashboard Overview Bento style */
                  <DashboardOverview
                    archive={archive}
                    apiKeys={apiKeys}
                    preferences={preferences}
                    setActiveTab={setActiveTab}
                    setSelectedArchiveId={setSelectedArchiveId}
                    setResult={setResult}
                    setIsSettingsOpen={setIsSettingsOpen}
                  />
                )}
              </motion.div>
            )}

            {activeTab === "new-publication" && (
              <motion.div
                key="new-publication"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full flex flex-col gap-6"
              >
                <PostGeneratorForm
                  agents={agents}
                  apiKeys={apiKeys}
                  onGenerate={handleGenerateComplete}
                  onStartGenerate={() => setResult(null)}
                  onToggleAgent={handleToggleAgent}
                  formData={editorFormData}
                  setFormData={setEditorFormData}
                  preferences={preferences}
                  masterConfig={masterConfig}
                />
                {result && (
                  <ResultsDisplay
                    result={result}
                    preferences={preferences}
                    customMetrics={masterConfig.customMetrics}
                  />
                )}
              </motion.div>
            )}

            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full"
              >
                <AgentPlayground
                  agents={agents}
                  apiKeys={apiKeys}
                  onUpdateAgents={updateAgents}
                  onResetAgents={() => {
                    updateAgents(DEFAULT_AGENTS);
                  }}
                  customModels={masterConfig.customModels}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          masterConfig={masterConfig}
          onSaveConfig={(newConfig) => {
            setMasterConfig(newConfig);
            localStorage.setItem("vm_master_config", JSON.stringify(newConfig));
          }}
          customCss={customCss}
          onSaveCustomCss={handleSaveCustomCss}
        />
      )}
    </div>
  );
}
