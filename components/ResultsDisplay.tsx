"use client";

import { Copy, TrendingUp, CheckCircle2, Award, Zap, Cpu } from "lucide-react";
import { useState } from "react";

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

export default function ResultsDisplay({ result }: { result: GenerationResult }) {
  const [copiedId, setCopiedId] = useState<any>(null);

  const copyToClipboard = async (id: any, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  if (!result || !result.best) return null;

  const renderCard = (variant: Variant, isBest: boolean = false) => {
    const varId = variant.id || Math.random().toString();

    return (
      <div
        key={varId}
        className={`glass-panel p-6 flex flex-col justify-between ${isBest ? "card-glowing border-accent" : ""}`}
        style={{
          height: "100%",
          minHeight: isBest ? "400px" : "320px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex flex-col gap-4 flex-1">
          {/* Header row */}
          <div className="flex justify-between items-center">
            <span className={`custom-badge ${isBest ? "custom-badge-accent" : ""}`}>
              {isBest ? (
                <>
                  <Award size={12} /> Master Synthesis
                </>
              ) : (
                <>
                  <span className="custom-badge-dot"></span> Draft
                </>
              )}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: isBest ? "var(--accent)" : "var(--zinc-400)" }}>
              <TrendingUp size={12} /> Score: {variant.score}/100
            </div>
          </div>

          {/* Model info / Angle */}
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>
            {variant.style}
          </div>

          {/* Clean editor-style preview pane */}
          <div
            className="p-4 flex-1"
            style={{
              background: "#08090d",
              border: "1px solid var(--zinc-800)",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              fontSize: isBest ? "0.9rem" : "0.8rem",
              lineHeight: 1.6,
              color: isBest ? "white" : "var(--zinc-300)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)",
              minHeight: "150px",
              overflowY: "auto",
            }}
          >
            {variant.content}
          </div>

          {/* Critique section */}
          <div
            className="py-3 px-4 rounded-8"
            style={{
              fontSize: "0.8rem",
              background: isBest ? "rgba(244, 63, 94, 0.02)" : "rgba(255,255,255,0.01)",
              borderLeft: `2px solid ${isBest ? "var(--accent)" : "var(--zinc-700)"}`,
              borderRadius: "0 8px 8px 0",
              lineHeight: 1.45,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1" style={{ color: isBest ? "var(--accent)" : "var(--zinc-500)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Cpu size={10} />
              <span>{isBest ? "Consensus Rationale" : "Draft Critique"}</span>
            </div>
            <p className="serif-italic" style={{ color: "var(--zinc-400)" }}>
              {variant.critique}
            </p>
          </div>
        </div>

        {/* Copy CTA */}
        <button
          className="custom-btn custom-btn-secondary w-full"
          style={{
            marginTop: "16px",
            height: "40px",
            ...(isBest ? { background: "rgba(244, 63, 94, 0.08)", borderColor: "var(--accent)", color: "white" } : {}),
          }}
          onClick={() => copyToClipboard(varId, variant.content)}
        >
          {copiedId === varId ? (
            <>
              <CheckCircle2 size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Post Content</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 anim-fade-up" style={{ marginTop: "40px" }}>
      
      <div className="flex justify-center items-center gap-2 mb-2">
        <div className="flow-step-icon active" style={{ width: "36px", height: "36px" }}>
          <Zap size={16} />
        </div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Consensus Settle Output
        </h2>
      </div>

      {/* Synthesis Section */}
      <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {renderCard(result.best, true)}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8" style={{ width: "100%" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--zinc-800)" }}></div>
        <div className="flex items-center gap-2" style={{ color: "var(--zinc-500)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <Cpu size={12} />
          <span>Draft Comparison Logs</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "var(--zinc-800)" }}></div>
      </div>

      {/* Drafts comparative layout */}
      <div className="grid-2">
        {result.drafts.map((draft) => renderCard(draft, false))}
      </div>
    </div>
  );
}
