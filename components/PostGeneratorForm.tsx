"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Info, BookOpen, User, Flame, Cpu, ShieldAlert } from "lucide-react";

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

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

interface GenerationResult {
  best: Variant;
  drafts: Variant[];
}

export default function PostGeneratorForm({
  agents,
  judgeConfig,
  apiKeys,
  onGenerate,
  onToggleAgent,
}: {
  agents: Agent[];
  judgeConfig: JudgeConfig;
  apiKeys: ApiKeys;
  onGenerate: (data: GenerationResult) => void;
  onToggleAgent: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    targetAudience: "",
    tone: "Professional, punchy, engaging",
  });

  // Consensus flow simulation state
  const [loadingStep, setLoadingStep] = useState(0);
  const [flowSteps, setFlowSteps] = useState<string[]>([]);

  const activeAgents = agents.filter((a) => a.enabled);

  useEffect(() => {
    if (loading) {
      // Build dynamic steps based on enabled agents
      const steps = [
        "Connecting to api endpoints & loading agents...",
        "Scoping trending LinkedIn formatting indexes...",
        ...activeAgents.map((a) => `[${a.name}] is drafting post (${a.provider}/${a.model})...`),
        `[Judge consensus] weighing drafts with ${judgeConfig.provider}/${judgeConfig.model}...`,
        "Settle on absolute best post outcome & finalizing formats.",
      ];
      setFlowSteps(steps);

      const interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 2500);

      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
      setFlowSteps([]);
    }
  }, [loading, agents, judgeConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (activeAgents.length < 2) {
      setError("Please enable at least 2 agents in the Agent Playground to run consensus.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          apiKeys,
          agents,
          judgeConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation pipeline failed.");
      }

      onGenerate(data.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="grid" style={{ gridTemplateColumns: loading ? "1fr" : "1.2fr 1fr", gap: "24px" }}>
        
        {/* Left Panel: Input context */}
        {!loading && (
          <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col gap-4 anim-fade-up">
            <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "12px" }}>
              <Flame style={{ color: "var(--accent)" }} size={16} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Post Context</h2>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Info size={14} style={{ color: "var(--zinc-500)" }} /> App / Project Name
              </label>
              <input
                required
                type="text"
                id="appName"
                name="appName"
                className="form-input"
                placeholder="e.g. Virality Mapper"
                value={formData.appName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <BookOpen size={14} style={{ color: "var(--zinc-500)" }} /> What does it do?
              </label>
              <textarea
                required
                id="description"
                name="description"
                className="form-input"
                placeholder="Explain what problem it solves and its main features..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  <User size={14} style={{ color: "var(--zinc-500)" }} /> Target Audience
                </label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  className="form-input"
                  placeholder="e.g. Indie Hackers"
                  value={formData.targetAudience}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Flame size={14} style={{ color: "var(--zinc-500)" }} /> Writing Tone
                </label>
                <input
                  type="text"
                  id="tone"
                  name="tone"
                  className="form-input"
                  placeholder="e.g. Inspiring, data-driven"
                  value={formData.tone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 flex items-start gap-3" style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px" }}>
                <ShieldAlert size={16} style={{ color: "var(--accent)", marginTop: "2px" }} />
                <p style={{ fontSize: "0.85rem", color: "#fca5a5" }}>{error}</p>
              </div>
            )}

            <button type="submit" className="custom-btn custom-btn-accent w-full" style={{ marginTop: "12px" }}>
              <Sparkles size={16} /> Run Multi-Agent Consensus
            </button>
          </form>
        )}

        {/* Right Panel: Consensus flow / Active agents status */}
        {loading ? (
          /* Real-time Consensus flow display */
          <div className="glass-panel p-8 w-full max-w-2xl mx-auto flex flex-col gap-6 anim-fade-up">
            <div className="flex flex-col gap-2 text-center items-center">
              <div className="flow-step-icon active" style={{ width: "48px", height: "48px", marginBottom: "8px" }}>
                <Cpu className="animate-spin" size={24} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Deliberating Consensus...</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)" }}>
                Evaluating angles across multiple AI sources to build the optimal outcome.
              </p>
            </div>

            <div className="flex flex-col border-l border-zinc-800 ml-4 pl-4" style={{ marginTop: "16px" }}>
              {flowSteps.map((step, index) => {
                const isActive = index === loadingStep;
                const isCompleted = index < loadingStep;
                
                return (
                  <div key={index} className={`flex items-center gap-4 py-3 opacity-40 transition-all duration-300 ${isActive ? "opacity-100" : ""} ${isCompleted ? "opacity-80" : ""}`}>
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full border-2 ${isActive ? "bg-rose-500 border-rose-500 animate-pulse" : isCompleted ? "bg-emerald-500 border-emerald-500" : "bg-transparent border-zinc-700"}`} style={{ marginLeft: "-21px" }}></div>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 500, color: isActive ? "white" : isCompleted ? "var(--zinc-300)" : "var(--zinc-500)" }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active agents dashboard widget */
          <div className="glass-panel p-6 flex flex-col gap-4 anim-fade-up">
            <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "12px" }}>
              <Cpu style={{ color: "var(--accent)" }} size={16} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Active Agents Dashboard</h2>
            </div>
            
            <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)", marginBottom: "8px" }}>
              The context will be sent to the following active agents. Toggle them to test different consensus combinations.
            </p>

            <div className="flex flex-col gap-3">
              {agents.map((agent) => (
                <div key={agent.id} className={`flex items-center justify-between p-3 rounded-8 border ${agent.enabled ? "bg-zinc-950/60 border-zinc-800" : "bg-transparent border-zinc-900 opacity-50"}`} style={{ borderRadius: "8px" }}>
                  <div className="flex flex-col gap-0.5">
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: agent.enabled ? "white" : "var(--zinc-400)" }}>
                      {agent.name}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--zinc-500)" }}>
                      {agent.provider.toUpperCase()} • {agent.model}
                    </span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={agent.enabled} onChange={() => onToggleAgent(agent.id)} />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
