"use client";

import React from "react";

interface CrawlerConfig {
  enginePriority: string[];
  targetYear: number;
  serpapiEnabled: boolean;
}

interface CrawlersTabProps {
  crawlerConfig: CrawlerConfig;
  enableRAG: boolean;
  handleConfigChange: (path: string, value: unknown) => void;
  handlePrefChange: (key: string, value: unknown) => void;
}

export default function CrawlersTab({
  crawlerConfig,
  enableRAG,
  handleConfigChange,
  handlePrefChange,
}: CrawlersTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Grounding & Scrapers</h3>
        <p className="text-xs text-zinc-500">
          Manage how real-time news indexing, scraping pipelines, and the internal archive work.
        </p>
      </div>

      <div className="typographic-form">
        {/* Target Year */}
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label">Target Year Range</label>
            <input
              type="number"
              min="2000"
              max="2030"
              className="minimal-input mt-1"
              value={crawlerConfig.targetYear}
              onChange={(e) => handleConfigChange("crawlerConfig.targetYear", parseInt(e.target.value) || 2026)}
            />
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">Limits search crawler recency check.</span>
          </div>
        </div>

        {/* SerpApi Activation Toggle */}
        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-xs font-semibold text-white">Enable Real-Time Google SerpApi</span>
                <span className="text-[10px] text-zinc-500 font-mono">Use key under connections to query google search.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={crawlerConfig.serpapiEnabled}
                  onChange={(e) => handleConfigChange("crawlerConfig.serpapiEnabled", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* RAG Toggle */}
        <div className="settings-form-row">
          <span className="row-num">03 /</span>
          <div className="row-content">
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-xs font-semibold text-white">Lightweight RAG Engine</span>
                <span className="text-[10px] text-zinc-500 font-mono">Use local string similarity vectors matching archives.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={enableRAG}
                  onChange={(e) => handlePrefChange("enableRAG", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Crawler Engine Priority List */}
        <div className="settings-form-row">
          <span className="row-num">04 /</span>
          <div className="row-content">
            <label className="row-label mb-2 block">Scraper Pipeline Priority Fallback</label>
            <div className="flex flex-col border border-zinc-800 divide-y divide-zinc-800 font-mono text-xs">
              {crawlerConfig.enginePriority.map((engine, idx) => (
                <div key={engine} className="flex justify-between items-center p-3">
                  <div>
                    <span className="text-zinc-500 mr-2">{idx + 1}.</span>
                    <span className="font-bold text-white uppercase">{engine.replace("_", " ")}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        const arr = [...crawlerConfig.enginePriority];
                        const temp = arr[idx];
                        arr[idx] = arr[idx - 1];
                        arr[idx - 1] = temp;
                        handleConfigChange("crawlerConfig.enginePriority", arr);
                      }}
                      className="text-zinc-500 hover:text-white font-mono text-[9px] uppercase border border-zinc-800 hover:border-zinc-500 px-2 py-1 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                    >
                      Up
                    </button>
                    <button
                      disabled={idx === crawlerConfig.enginePriority.length - 1}
                      onClick={() => {
                        const arr = [...crawlerConfig.enginePriority];
                        const temp = arr[idx];
                        arr[idx] = arr[idx + 1];
                        arr[idx + 1] = temp;
                        handleConfigChange("crawlerConfig.enginePriority", arr);
                      }}
                      className="text-zinc-500 hover:text-white font-mono text-[9px] uppercase border border-zinc-800 hover:border-zinc-500 px-2 py-1 transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
