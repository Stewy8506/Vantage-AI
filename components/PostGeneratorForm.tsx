"use client";

import { useState, useEffect, useRef } from "react";
import { Cpu, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostInputFields from "./workspace/PostInputFields";
import HUDLogConsole from "./workspace/HUDLogConsole";
import DebateTimeline from "./workspace/DebateTimeline";

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

interface GenerationCompletePayload extends GenerationResult {
  appName?: string;
  description?: string;
  targetAudience?: string;
  tone?: string;
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

interface StreamEventData {
  message?: string;
  type?: "info" | "warning" | "success";
  name?: string;
  content?: string;
  hookExplanation?: string;
  provider?: string;
  model?: string;
  from?: string;
  to?: string;
  score?: number;
  argument?: string;
  best?: GenerationResult["best"];
}

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

export default function PostGeneratorForm({
  agents,
  apiKeys,
  onGenerate,
  onStartGenerate,
  formData,
  setFormData,
  preferences,
  masterConfig,
}: {
  agents: Agent[];
  apiKeys: ApiKeys;
  onGenerate: (data: GenerationCompletePayload) => void;
  onStartGenerate?: () => void;
  onToggleAgent?: (id: string) => void;
  formData: {
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  }>>;
  preferences: UserPreferences;
  masterConfig: MasterConfig;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeAgentsCount = agents.filter((a) => a.enabled).length;

  // Real-time streaming debate states
  const [statusMessage, setStatusMessage] = useState("");
  const [trends, setTrends] = useState<string[]>([]);
  const [, setDrafts] = useState<Record<string, { content: string; hookExplanation: string }>>({});
  const [critiques, setCritiques] = useState<Array<{ from: string; to: string; content: string; score: number }>>([]);
  const [, setRefinements] = useState<Record<string, { content: string; score: number; argument: string }>>({});
  const [settledPost, setSettledPost] = useState<GenerationResult["best"] | null>(null);

  // Typewriter output states
  const [typedDrafts, setTypedDrafts] = useState<Record<string, string>>({});
  const [typedRefinements, setTypedRefinements] = useState<Record<string, string>>({});
  const [typedSettledContent, setTypedSettledContent] = useState("");

  // Activity logs & elapsed stopwatch
  const [activityLogs, setActivityLogs] = useState<Array<{ id: string; time: string; text: string; type: "info" | "warning" | "success" }>>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activityContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll activity container to bottom on new log
  useEffect(() => {
    if (activityContainerRef.current) {
      activityContainerRef.current.scrollTop = activityContainerRef.current.scrollHeight;
    }
  }, [activityLogs]);

  // Stopwatch Timer
  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Refs to prevent state closure bugs in streams
  const trendsRef = useRef<string[]>([]);
  const draftsRef = useRef<Record<string, { name: string; content: string; hookExplanation: string; provider: string; model: string }>>({});
  const critiquesRef = useRef<Array<{ from: string; to: string; content: string; score: number }>>([]);
  const refinementsRef = useRef<Record<string, { name: string; content: string; score: number; argument: string; provider: string; model: string }>>({});

  // Typewriter simulation helper
  const animateText = (targetKey: string, fullText: string, setter: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    let currentIdx = 0;
    setter(prev => ({ ...prev, [targetKey]: "" }));
    const interval = setInterval(() => {
      currentIdx += 20;
      if (currentIdx >= fullText.length) {
        setter(prev => ({ ...prev, [targetKey]: fullText }));
        clearInterval(interval);
      } else {
        setter(prev => ({ ...prev, [targetKey]: fullText.slice(0, currentIdx) }));
      }
    }, 15);
  };

  const animateSettledText = (fullText: string) => {
    let currentIdx = 0;
    setTypedSettledContent("");
    const interval = setInterval(() => {
      currentIdx += 25;
      if (currentIdx >= fullText.length) {
        setTypedSettledContent(fullText);
        clearInterval(interval);
      } else {
        setTypedSettledContent(fullText.slice(0, currentIdx));
      }
    }, 15);
  };

  const getActiveStep = () => {
    if (settledPost || statusMessage.includes("Settle") || statusMessage.includes("Consensus")) return 4;
    if (statusMessage.includes("Refinement") || statusMessage.includes("refinement")) return 3;
    if (statusMessage.includes("Debate") || statusMessage.includes("Critique") || statusMessage.includes("critique")) return 2;
    if (statusMessage.includes("drafting") || statusMessage.includes("Drafting")) return 1;
    return 0;
  };

  const activeStep = getActiveStep();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStreamEvent = (event: string, data: StreamEventData | string[]) => {
    switch (event) {
      case "status": {
        const payload = data as StreamEventData;
        setStatusMessage(payload.message || "");
        break;
      }

      case "trends": {
        const payload = data as string[];
        trendsRef.current = payload;
        setTrends(payload);
        break;
      }

      case "activity": {
        const payload = data as StreamEventData;
        setActivityLogs(prev => [
          ...prev,
          {
            id: `act-${Date.now()}-${Math.random()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            text: payload.message || "",
            type: payload.type || "info"
          }
        ]);
        break;
      }

      case "draft-complete": {
        const payload = data as { name: string; content: string; hookExplanation: string; provider: string; model: string };
        draftsRef.current[payload.name] = payload;
        setDrafts(prev => {
          const updated = { ...prev, [payload.name]: { content: payload.content, hookExplanation: payload.hookExplanation } };
          animateText(payload.name, payload.content, setTypedDrafts);
          return updated;
        });
        break;
      }

      case "critique-complete": {
        const payload = data as { from: string; to: string; content: string; score: number };
        critiquesRef.current.push({ from: payload.from, to: payload.to, content: payload.content, score: payload.score });
        setCritiques(prev => [
          ...prev,
          { from: payload.from, to: payload.to, content: payload.content, score: payload.score }
        ]);
        break;
      }

      case "refine-complete": {
        const payload = data as { name: string; content: string; score: number; argument: string; provider: string; model: string };
        refinementsRef.current[payload.name] = payload;
        setRefinements(prev => {
          const updated = { ...prev, [payload.name]: { content: payload.content, score: payload.score, argument: payload.argument } };
          animateText(payload.name, payload.content, setTypedRefinements);
          return updated;
        });
        break;
      }

      case "consensus-complete": {
        const payload = data as { best: GenerationResult["best"] };
        setSettledPost(payload.best);
        animateSettledText(payload.best.content);

        // Dispatch result after typing transitions complete
        setTimeout(() => {
          onGenerate({
            appName: formData.appName,
            description: formData.description,
            targetAudience: formData.targetAudience,
            tone: formData.tone,
            trends: trendsRef.current,
            initialDrafts: Object.entries(draftsRef.current).map(([name, d]) => ({
              name,
              content: d.content,
              hookExplanation: d.hookExplanation,
              provider: d.provider,
              model: d.model,
            })),
            critiques: critiquesRef.current,
            refinedDrafts: Object.entries(refinementsRef.current).map(([name, r]) => ({
              name,
              content: r.content,
              score: r.score,
              argument: r.argument,
              provider: r.provider,
              model: r.model,
            })),
            best: payload.best
          });
          setLoading(false);
        }, 3000);
        break;
      }

      case "error": {
        const payload = data as StreamEventData;
        setError(payload.message || "An unexpected error occurred.");
        setLoading(false);
        break;
      }

      default:
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatusMessage("Connecting to debate server...");

    if (onStartGenerate) {
      onStartGenerate();
    }

    // Reset debate boards & monitor
    setTrends([]);
    setDrafts({});
    setCritiques([]);
    setRefinements({});
    setSettledPost(null);
    setTypedDrafts({});
    setTypedRefinements({});
    setTypedSettledContent("");
    setActivityLogs([]);
    setElapsedTime(0);

    trendsRef.current = [];
    draftsRef.current = {};
    critiquesRef.current = [];
    refinementsRef.current = {};

    if (agents.length < 3) {
      setError("This debate flow requires exactly 3 configured agents in your playground.");
      setLoading(false);
      return;
    }

    // Load local feedback-loop analytics templates if RAG is enabled
    let enrichedSuccessTemplates: Array<{
      content: string;
      niche: string;
      metrics: {
        likes: number;
        comments: number;
        reposts: number;
      };
      structure: {
        hook: string;
        body: string;
        cta: string;
        metaphor: string;
      };
    }> = [];
    if (preferences.enableRAG) {
      try {
        const localArchiveStr = localStorage.getItem("vm_post_archive");
        if (localArchiveStr) {
          const parsedArchive = JSON.parse(localArchiveStr) as ArchivedPost[];
          enrichedSuccessTemplates = parsedArchive
            .filter((item) => item.performance && item.performance.likes > 0)
            .map((item) => {
              const perf = item.performance!;
              return {
                content: item.result?.best?.content || "",
                niche: item.appName || "LinkedIn Post",
                metrics: {
                  likes: Number(perf.likes),
                  comments: Number(perf.comments),
                  reposts: Math.round(Number(perf.likes) * 0.08)
                },
                structure: {
                  hook: item.result?.best?.scores?.hookStrength ? `Hook strength: ${item.result.best.scores.hookStrength}` : "Enriched RAG Hook Template.",
                  body: "Self-published successful layout.",
                  cta: "Optimized user CTA.",
                  metaphor: "Ground-truth benchmark."
                }
              };
            });
        }
      } catch (e) {
        console.warn("Failed to load local analytics templates for RAG enrichment:", e);
      }
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          apiKeys,
          agents,
          enrichedSuccessTemplates,
          customMetrics: masterConfig.customMetrics,
          customPersonas: masterConfig.customPersonas,
          crawlerConfig: masterConfig.crawlerConfig,
          advancedParams: masterConfig.advancedParams,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate debate arena.");
      }

      if (!res.body) {
        throw new Error("Response stream is not readable.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventName = "";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr = line.replace("data:", "").trim();
            }
          }

          if (eventName && dataStr) {
            try {
              const data = JSON.parse(dataStr);
              handleStreamEvent(eventName, data);
            } catch (err) {
              console.error("Stream payload syntax error:", err, dataStr);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected debate pipeline error occurred.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <PostInputFields
              formData={formData}
              handleChange={handleChange}
              activeAgentsCount={activeAgentsCount}
              loading={loading}
              error={error}
              agents={agents}
              handleSubmit={handleSubmit}
            />
          </motion.div>
        ) : (
          /* Live Visual Whiteboard Debate Panel */
          <motion.div
            key="debate-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="glass-panel p-6 w-full flex flex-col gap-6"
            style={{ minHeight: "480px" }}
          >
            {/* Whiteboard Header */}
            <div className="flex flex-col gap-4 text-center items-center" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "24px" }}>
              <div className="flex items-center gap-4 justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cpu className="animate-spin text-rose-500" size={20} />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }} className="text-white">Debate Settle Console</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono text-zinc-400" style={{ background: "var(--background)", borderColor: "var(--border-muted)" }}>
                  <Clock size={12} className="text-rose-500 animate-pulse" />
                  <span>ELAPSED TIME: {formatTime(elapsedTime)}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--zinc-300)", fontWeight: 500, margin: 0 }} className="italic">
                {statusMessage || "Grounding and preparing agents..."}
              </p>
            </div>

            {/* Split layout: Vertical timeline on the left rail, debate content on the right */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Left Column: Vertical Timeline */}
              <DebateTimeline activeStep={activeStep} />

              {/* Right Column: Main Debate Content */}
              <HUDLogConsole
                statusMessage={statusMessage}
                elapsedTime={elapsedTime}
                formatTime={formatTime}
                activityLogs={activityLogs}
                activityContainerRef={activityContainerRef}
                trends={trends}
                activeStep={activeStep}
                typedDrafts={typedDrafts}
                typedRefinements={typedRefinements}
                typedSettledContent={typedSettledContent}
                error={error}
                critiques={critiques}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
