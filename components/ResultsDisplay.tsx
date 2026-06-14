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
        className="glass-panel p-6 flex flex-col justify-between"
        style={{
          height: "100%",
          minHeight: isBest ? "380px" : "300px",
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
                  <Award size={10} /> MASTER SYNTHESIS
                </>
              ) : (
                <>
                  <span className="custom-badge-dot"></span> DRAFT
                </>
              )}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400" style={{ fontFamily: "var(--font-mono)" }}>
              <TrendingUp size={11} /> Score: {variant.score}/100
            </div>
          </div>

          {/* Model info / Angle */}
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
            {variant.style}
          </div>

          {/* Clean editor-style preview pane */}
          <div
            className="p-4 flex-1"
            style={{
              background: "#000000",
              border: "1px solid var(--border-muted)",
              borderRadius: "6px",
              whiteSpace: "pre-wrap",
              fontSize: isBest ? "0.85rem" : "0.8rem",
              lineHeight: 1.6,
              color: isBest ? "white" : "var(--zinc-300)",
              minHeight: "150px",
              overflowY: "auto",
              fontFamily: "var(--font-sans)",
            }}
          >
            {variant.content}
          </div>

          {/* Critique section */}
          <div
            className="py-3 px-4 rounded"
            style={{
              fontSize: "0.8rem",
              background: "#000000",
              borderLeft: "1px solid var(--border-active)",
              borderRadius: "0 6px 6px 0",
              lineHeight: 1.45,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--zinc-400)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
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
            height: "38px",
            fontSize: "0.8rem",
            ...(isBest ? { background: "white", color: "black", borderColor: "white" } : {}),
          }}
          onClick={() => copyToClipboard(varId, variant.content)}
        >
          {copiedId === varId ? (
            <>
              <CheckCircle2 size={12} />
              <span style={{ fontWeight: 600 }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy Post Content</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 anim-fade-up" style={{ marginTop: "40px", paddingBottom: "40px" }}>
      
      <div className="flex justify-center items-center gap-2 mb-2">
        <div className="flow-step-icon active" style={{ width: "28px", height: "28px" }}>
          <Zap size={12} />
        </div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Consensus Settle Output
        </h2>
      </div>

      {/* Synthesis Section */}
      <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {renderCard(result.best, true)}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8" style={{ width: "100%" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
        <div className="flex items-center gap-2" style={{ color: "var(--zinc-500)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
          <Cpu size={10} />
          <span>Draft Comparison Logs</span>
        </div>
        <div style={{ flex: 1, height: "1px", background: "var(--border-muted)" }}></div>
      </div>

      {/* Drafts comparative layout */}
      <div className="grid-2">
        {result.drafts.map((draft) => renderCard(draft, false))}
      </div>
    </div>
  );
}
