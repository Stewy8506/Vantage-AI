"use client";

import React from "react";

interface CustomMetric {
  id: string;
  name: string;
  weight: number;
  scoringInstructions: string;
}

interface MetricsTabProps {
  customMetrics: CustomMetric[];
  newMetric: CustomMetric;
  setNewMetric: React.Dispatch<React.SetStateAction<CustomMetric>>;
  handleAddMetric: () => void;
  handleRemoveMetric: (id: string) => void;
}

export default function MetricsTab({
  customMetrics,
  newMetric,
  setNewMetric,
  handleAddMetric,
  handleRemoveMetric,
}: MetricsTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Critique Metrics</h3>
        <p className="text-xs text-zinc-500">
          Define custom evaluation axes used in peer debates and final post scoring.
        </p>
      </div>

      <div className="typographic-form">
        {/* Add Metric */}
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label">Add Critique Metric</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Metric Name (Display)</span>
                <input
                  type="text"
                  placeholder="e.g. Technical Accuracy"
                  className="minimal-input text-xs"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-mono mb-1">Metric Key (CamelCase/id)</span>
                <input
                  type="text"
                  placeholder="e.g. techAccuracy"
                  className="minimal-input text-xs font-mono"
                  value={newMetric.id}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, id: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col mt-4">
              <span className="text-[10px] text-zinc-500 font-mono mb-1">Score Weight ({newMetric.weight}%)</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newMetric.weight}
                onChange={(e) => setNewMetric(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                className="w-full"
              />
            </div>

            <div className="flex flex-col mt-4">
              <span className="text-[10px] text-zinc-500 font-mono mb-1">Scoring Prompts & Instructions</span>
              <textarea
                className="minimal-input text-xs"
                placeholder="Detail guidelines for grading... Output score 0-100."
                rows={3}
                value={newMetric.scoringInstructions}
                onChange={(e) => setNewMetric(prev => ({ ...prev, scoringInstructions: e.target.value }))}
              />
            </div>

            <button
              onClick={handleAddMetric}
              className="custom-btn custom-btn-accent text-xs font-mono py-2 px-4 mt-4"
            >
              + Add Metric Axis
            </button>
          </div>
        </div>

        {/* Metrics List */}
        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <label className="row-label mb-2 block">Active Critique Axes</label>
            <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
              {customMetrics.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 font-sans">No evaluation metrics registered.</div>
              ) : (
                customMetrics.map((m) => (
                  <div key={m.id} className="flex justify-between items-start p-3">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 font-sans">
                        <span className="font-bold text-white text-[12px]">{m.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({m.weight}%)</span>
                      </div>
                      <div className="text-zinc-500 text-[10px] mt-0.5 font-mono">ID: {m.id}</div>
                      <div className="text-zinc-400 text-[10px] mt-1 italic font-sans line-clamp-2" title={m.scoringInstructions}>
                        {m.scoringInstructions || "No instructions provided."}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMetric(m.id)}
                      className="text-zinc-500 hover:text-rose-500 font-mono text-[9px] uppercase border border-zinc-800 hover:border-rose-500 px-2 py-1 transition-colors mt-1"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
