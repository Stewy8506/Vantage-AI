"use client";

import { Sparkles, TrendingUp } from "lucide-react";
import React from "react";

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
    score?: number;
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

interface PerformanceAnalyticsProps {
  selectedItem: ArchivedPost;
  editingPerformanceId: string | null;
  setEditingPerformanceId: (id: string | null) => void;
  impressions: number;
  setImpressions: (val: number) => void;
  likes: number;
  setLikes: (val: number) => void;
  comments: number;
  setComments: (val: number) => void;
  handleSavePerformance: (id: string, perfData: { impressions: number; likes: number; comments: number }) => void;
  handleDeleteArchive: (id: string) => void;
  setEditorFormData: (data: {
    appName: string;
    description: string;
    targetAudience: string;
    tone: string;
    hookArchetype: string;
  }) => void;
  setSelectedArchiveId: (id: string | null) => void;
  setResult: (res: GenerationResult | null) => void;
  setActiveTab: (tab: "workspace" | "new-publication" | "agents") => void;
}

export default function PerformanceAnalytics({
  selectedItem,
  editingPerformanceId,
  setEditingPerformanceId,
  impressions,
  setImpressions,
  likes,
  setLikes,
  comments,
  setComments,
  handleSavePerformance,
  handleDeleteArchive,
  setEditorFormData,
  setSelectedArchiveId,
  setResult,
  setActiveTab,
}: PerformanceAnalyticsProps) {
  return (
    <div className="flex flex-col gap-4" style={{ borderTop: "1px solid var(--border-muted)", paddingTop: "24px" }}>
      <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "12px" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-zinc-400" />
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
            setActiveTab("new-publication");
          }}
          className="custom-btn custom-btn-secondary text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer font-bold"
        >
          Clone parameters to Editor
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">AppName</strong> <span className="text-zinc-200 font-medium">{selectedItem.appName}</span></div>
        <div><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Tone</strong> <span className="text-zinc-200 font-medium">{selectedItem.tone || "General"}</span></div>
        <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Description</strong> <span className="text-zinc-300 leading-relaxed">{selectedItem.description}</span></div>
        <div style={{ gridColumn: "span 2" }}><strong className="text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Target Audience</strong> <span className="text-zinc-300 leading-relaxed">{selectedItem.targetAudience || "General Professionals"}</span></div>
      </div>

      {/* Performance metrics dashboard inline */}
      <div style={{ borderTop: "1px dashed var(--border-muted)", paddingTop: "16px", marginTop: "8px" }}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
            <TrendingUp size={13} className="text-zinc-400 animate-pulse" />
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
          <div className="flex flex-wrap gap-4 items-end p-4 rounded-xl border border-zinc-800/40" style={{ background: "rgba(0,0,0,0.15)", borderColor: "var(--border-muted)" }}>
            <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
              <span>Impressions</span>
              <input
                type="number"
                className="form-input text-xs w-28 h-8 p-1.5"
                value={impressions}
                onChange={(e) => setImpressions(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
              <span>Likes</span>
              <input
                type="number"
                className="form-input text-xs w-28 h-8 p-1.5"
                value={likes}
                onChange={(e) => setLikes(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-400">
              <span>Comments</span>
              <input
                type="number"
                className="form-input text-xs w-28 h-8 p-1.5"
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
                className="custom-btn custom-btn-accent text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPerformanceId(null)}
                className="custom-btn custom-btn-secondary text-[11px] h-8 px-4 flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedItem.performance ? (
          <div className="flex items-center gap-4 justify-between bg-zinc-900/10 border border-zinc-800/20 p-3 rounded-xl text-xs font-mono text-zinc-300">
            <div className="flex gap-6">
              <div><span className="text-zinc-500 font-semibold uppercase text-[9px] mr-1">Impressions:</span> {selectedItem.performance!.impressions.toLocaleString()}</div>
              <div><span className="text-zinc-500 font-semibold uppercase text-[9px] mr-1">Likes:</span> {selectedItem.performance!.likes.toLocaleString()}</div>
              <div><span className="text-zinc-500 font-semibold uppercase text-[9px] mr-1">Comments:</span> {selectedItem.performance!.comments.toLocaleString()}</div>
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
                className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer border-0 bg-transparent font-bold"
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
              className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer border-0 bg-transparent font-bold ml-2"
            >
              [Delete Publication]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
