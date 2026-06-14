"use client";

import React from "react";

interface AdvancedParams {
  temperature: number;
  topP: number;
  topK: number;
  presencePenalty: number;
  frequencyPenalty: number;
  seed: number;
  stopSequences: string;
}

interface HyperparamsTabProps {
  advancedParams: AdvancedParams;
  handleConfigChange: (path: string, value: unknown) => void;
}

export default function HyperparamsTab({
  advancedParams,
  handleConfigChange,
}: HyperparamsTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Hyperparameters</h3>
        <p className="text-xs text-zinc-500">
          Tune advanced model generation parameters globally.
        </p>
      </div>

      <div className="typographic-form">
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label flex justify-between">
              <span>Temperature (Randomness)</span>
              <span className="text-xs text-white font-mono">{advancedParams.temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={advancedParams.temperature}
              onChange={(e) => handleConfigChange("advancedParams.temperature", parseFloat(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <label className="row-label flex justify-between">
              <span>Top-P (Nucleus Sampling)</span>
              <span className="text-xs text-white font-mono">{advancedParams.topP}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={advancedParams.topP}
              onChange={(e) => handleConfigChange("advancedParams.topP", parseFloat(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">03 /</span>
          <div className="row-content">
            <label className="row-label flex justify-between">
              <span>Top-K</span>
              <span className="text-xs text-white font-mono">{advancedParams.topK}</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={advancedParams.topK}
              onChange={(e) => handleConfigChange("advancedParams.topK", parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">04 /</span>
          <div className="row-content">
            <label className="row-label flex justify-between">
              <span>Presence Penalty</span>
              <span className="text-xs text-white font-mono">{advancedParams.presencePenalty}</span>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={advancedParams.presencePenalty}
              onChange={(e) => handleConfigChange("advancedParams.presencePenalty", parseFloat(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">05 /</span>
          <div className="row-content">
            <label className="row-label flex justify-between">
              <span>Frequency Penalty</span>
              <span className="text-xs text-white font-mono">{advancedParams.frequencyPenalty}</span>
            </label>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={advancedParams.frequencyPenalty}
              onChange={(e) => handleConfigChange("advancedParams.frequencyPenalty", parseFloat(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">06 /</span>
          <div className="row-content">
            <label className="row-label">Deterministic Seed</label>
            <input
              type="number"
              className="minimal-input font-mono mt-1"
              value={advancedParams.seed}
              onChange={(e) => handleConfigChange("advancedParams.seed", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">07 /</span>
          <div className="row-content">
            <label className="row-label">Stop Sequences (Comma-separated)</label>
            <input
              type="text"
              className="minimal-input font-mono mt-1"
              placeholder="e.g. \\n, ###, User:"
              value={advancedParams.stopSequences}
              onChange={(e) => handleConfigChange("advancedParams.stopSequences", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
