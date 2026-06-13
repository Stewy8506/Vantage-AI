"use client";

import { Copy, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

export default function ResultsDisplay({ variants }: { variants: Variant[] }) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="flex-col gap-6 mt-8 animate-fade-in" style={{ width: "100%", maxWidth: "800px", margin: "32px auto 0" }}>
      <h2 className="text-center mb-6" style={{ fontSize: "2rem", fontWeight: 700 }}>
        <span className="text-gradient">Viral Variants</span> Generated
      </h2>

      <div className="grid">
        {variants.map((variant, index) => (
          <div 
            key={variant.id || index} 
            className="glass p-6" 
            style={{ 
              animationDelay: `${index * 0.15}s`, 
              borderTop: "4px solid var(--primary)" 
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="badge">{variant.style}</span>
              <div className="flex items-center gap-2" style={{ color: "var(--secondary)", fontWeight: 700 }}>
                <TrendingUp size={18} />
                Score: {variant.score}/100
              </div>
            </div>

            <div 
              className="mb-4 p-4" 
              style={{ 
                background: "rgba(0,0,0,0.4)", 
                borderRadius: "8px", 
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: 1.6,
                color: "#e4e4e7"
              }}
            >
              {variant.content}
            </div>

            <div className="mb-6" style={{ fontSize: "0.9rem", color: "#a1a1aa", fontStyle: "italic", borderLeft: "2px solid var(--glass-border)", paddingLeft: "12px" }}>
              <strong>AI Critique:</strong> {variant.critique}
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ width: "100%" }}
              onClick={() => copyToClipboard(variant.id || index, variant.content)}
            >
              {copiedId === (variant.id || index) ? (
                <>
                  <CheckCircle2 size={18} style={{ color: "var(--secondary)" }} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Post
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
