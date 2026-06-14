"use client";

import { Copy, TrendingUp, CheckCircle2, Award, Zap, Cpu } from "lucide-react";
import { useState } from "react";

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
    critique: string; // hold synthesisRationale
  };
}

export default function ResultsDisplay({ result }: { result: GenerationResult }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [arenaTab, setArenaTab] = useState<"drafts" | "critiques" | "refinements">("drafts");

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  if (!result || !result.best) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 anim-fade-up" style={{ marginTop: "40px", paddingBottom: "40px" }}>
      
      {/* Title */}
      <div className="flex justify-center items-center gap-2 mb-2">
        <div className="flow-step-icon active" style={{ width: "28px", height: "28px" }}>
          <Zap size={12} />
        </div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Debate Settle Output
        </h2>
      </div>

      {/* Live Trends Box */}
      {result.trends && result.trends.length > 0 && (
        <div className="glass-panel p-5" style={{ background: "rgba(244, 63, 94, 0.02)", border: "1px solid rgba(244, 63, 94, 0.08)" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-rose-500" />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--zinc-300)" }}>
              Real-time LinkedIn Trends Found
            </span>
          </div>
          <ul style={{ paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.trends.map((trend: string, idx: number) => (
              <li key={idx} style={{ fontSize: "0.8rem", color: "var(--zinc-400)", lineHeight: 1.45 }}>
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Synthesis Section */}
      <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ minHeight: "380px", border: "1px solid rgba(244, 63, 94, 0.25)", background: "rgba(244, 63, 94, 0.02)" }}>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="custom-badge custom-badge-accent">
                <Award size={10} /> CONSOLIDATED MASTER POST
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400" style={{ fontFamily: "var(--font-mono)" }}>
                <Zap size={11} className="text-amber-400" /> Viral Score: {result.best.score}/100
              </div>
            </div>

            {/* Clean editor-style preview pane */}
            <div
              className="p-4 flex-1"
              style={{
                background: "#000000",
                border: "1px solid var(--border-active)",
                borderRadius: "6px",
                whiteSpace: "pre-wrap",
                fontSize: "0.88rem",
                lineHeight: 1.6,
                color: "white",
                minHeight: "180px",
                overflowY: "auto",
                fontFamily: "var(--font-sans)",
              }}
            >
              {result.best.content}
            </div>

            {/* Rationale Section */}
            <div
              className="py-3 px-4 rounded"
              style={{
                fontSize: "0.8rem",
                background: "#000000",
                borderLeft: "2px solid var(--accent)",
                borderRadius: "0 6px 6px 0",
                lineHeight: 1.45,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--zinc-400)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                <Cpu size={10} />
                <span>Consensus Settle Rationale</span>
              </div>
              <p className="serif-italic" style={{ color: "var(--zinc-400)", margin: 0 }}>
                {result.best.critique}
              </p>
            </div>
          </div>

          {/* Copy Button */}
          <button
            className="custom-btn w-full"
            style={{
              marginTop: "16px",
              height: "38px",
              fontSize: "0.8rem",
              background: "white",
              color: "black",
              borderColor: "white",
              fontWeight: 600,
            }}
            onClick={() => copyToClipboard("best-settled", result.best.content)}
          >
            {copiedId === "best-settled" ? (
              <span className="flex items-center justify-center gap-1.5">
                <CheckCircle2 size={12} /> Copied!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Copy size={12} /> Copy Final Settle Post
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8" style={{ width: "100%" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
        <div className="flex items-center gap-2" style={{ color: "var(--zinc-500)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
          <Cpu size={10} />
          <span>Debate Arena Logs</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex justify-center items-center gap-6 mb-6" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "12px" }}>
        <button
          className={`tab-btn`}
          style={{
            background: "none",
            border: "none",
            color: arenaTab === "drafts" ? "white" : "var(--zinc-500)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            paddingBottom: "8px",
            borderBottom: arenaTab === "drafts" ? "2px solid var(--accent)" : "none",
            outline: "none",
          }}
          onClick={() => setArenaTab("drafts")}
        >
          Phase 1: Initial Drafts
        </button>
        <button
          className={`tab-btn`}
          style={{
            background: "none",
            border: "none",
            color: arenaTab === "critiques" ? "white" : "var(--zinc-500)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            paddingBottom: "8px",
            borderBottom: arenaTab === "critiques" ? "2px solid var(--accent)" : "none",
            outline: "none",
          }}
          onClick={() => setArenaTab("critiques")}
        >
          Phase 2: Critique Arena
        </button>
        <button
          className={`tab-btn`}
          style={{
            background: "none",
            border: "none",
            color: arenaTab === "refinements" ? "white" : "var(--zinc-500)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            paddingBottom: "8px",
            borderBottom: arenaTab === "refinements" ? "2px solid var(--accent)" : "none",
            outline: "none",
          }}
          onClick={() => setArenaTab("refinements")}
        >
          Phase 3: Refined Drafts
        </button>
      </div>

      {/* Tab Panels */}
      {arenaTab === "drafts" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {result.initialDrafts.map((draft, idx) => (
            <div key={idx} className="glass-panel p-5 flex flex-col justify-between" style={{ minHeight: "450px" }}>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="custom-badge" style={{ fontSize: "0.65rem" }}>{draft.name}</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--zinc-500)", fontFamily: "var(--font-mono)" }}>
                    {draft.provider.toUpperCase()} • {draft.model}
                  </span>
                </div>
                
                <div
                  className="p-3"
                  style={{
                    background: "#000000",
                    border: "1px solid var(--border-muted)",
                    borderRadius: "6px",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
                    color: "var(--zinc-300)",
                    height: "240px",
                    overflowY: "auto",
                  }}
                >
                  {draft.content}
                </div>

                <div className="p-3 rounded bg-[#07070a] border-l border-zinc-700" style={{ fontSize: "0.7rem", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-400)", marginBottom: "4px" }}>Hook Strategy:</span>
                  <span className="serif-italic" style={{ color: "var(--zinc-400)" }}>{draft.hookExplanation}</span>
                </div>
              </div>

              <button
                className="custom-btn custom-btn-secondary w-full"
                style={{ marginTop: "12px", height: "32px", fontSize: "0.75rem" }}
                onClick={() => copyToClipboard(`draft-${idx}`, draft.content)}
              >
                {copiedId === `draft-${idx}` ? "Copied!" : "Copy Draft"}
              </button>
            </div>
          ))}
        </div>
      )}

      {arenaTab === "critiques" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {result.critiques.map((crit, idx) => (
            <div key={idx} className="glass-panel p-5 flex flex-col gap-2" style={{ background: "rgba(10,10,10,0.5)" }}>
              <div className="flex justify-between items-center" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "8px", marginBottom: "4px" }}>
                <div className="flex items-center gap-1.5">
                  <span className="custom-badge" style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.05)" }}>{crit.from}</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--zinc-500)" }}>→</span>
                  <span className="custom-badge" style={{ fontSize: "0.65rem" }}>{crit.to}</span>
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--zinc-400)" }}>
                  Score: {crit.score}/100
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--zinc-300)", lineHeight: 1.45, margin: 0, whiteSpace: "pre-wrap" }}>
                "{crit.content}"
              </p>
            </div>
          ))}
        </div>
      )}

      {arenaTab === "refinements" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {result.refinedDrafts.map((refined, idx) => (
            <div key={idx} className="glass-panel p-5 flex flex-col justify-between" style={{ minHeight: "450px" }}>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="custom-badge custom-badge-accent" style={{ fontSize: "0.65rem" }}>{refined.name}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--zinc-400)", fontFamily: "var(--font-mono)" }}>
                    Self-Score: {refined.score}/100
                  </span>
                </div>
                
                <div
                  className="p-3"
                  style={{
                    background: "#000000",
                    border: "1px solid var(--border-muted)",
                    borderRadius: "6px",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
                    color: "var(--zinc-300)",
                    height: "240px",
                    overflowY: "auto",
                  }}
                >
                  {refined.content}
                </div>

                <div className="p-3 rounded bg-[#07070a] border-l border-zinc-700" style={{ fontSize: "0.7rem", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600, display: "block", color: "var(--zinc-400)", marginBottom: "4px" }}>Change Argument:</span>
                  <span className="serif-italic" style={{ color: "var(--zinc-400)" }}>{refined.argument}</span>
                </div>
              </div>

              <button
                className="custom-btn custom-btn-secondary w-full"
                style={{ marginTop: "12px", height: "32px", fontSize: "0.75rem" }}
                onClick={() => copyToClipboard(`refined-${idx}`, refined.content)}
              >
                {copiedId === `refined-${idx}` ? "Copied!" : "Copy Refined"}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
