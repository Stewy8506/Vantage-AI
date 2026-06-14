"use client";

import { CheckCircle2, Code } from "lucide-react";
import React from "react";

interface UserPreferences {
  linkedinName: string;
  linkedinHeadline: string;
  linkedinAvatar: string;
  layoutDensity: "compact" | "cozy" | "spacious";
  sidebarPosition: "left" | "right";
  autoCopyToClipboard: boolean;
  fontSize: number;
  customFontUrl?: string;
  customFontFamily?: string;
  showTransitions?: boolean;
}

interface UiTabProps {
  theme: string;
  font: string;
  prefs: UserPreferences;
  handleSelectTheme: (theme: string) => void;
  handleSelectFont: (font: string) => void;
  handlePrefChange: (key: string, value: unknown) => void;
  cssOverride: string;
  handleCssChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function UiTab({
  theme,
  font,
  prefs,
  handleSelectTheme,
  handleSelectFont,
  handlePrefChange,
  cssOverride,
  handleCssChange,
}: UiTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Themes & UI Styling</h3>
        <p className="text-xs text-zinc-500">
          Tailor workspace aesthetics, layout density, and custom css variables.
        </p>
      </div>

      <div className="typographic-form">
        {/* Theme Swatches */}
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label">Aesthetic Theme Preset</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              {[
                { id: "obsidian", name: "Obsidian Black", bg: "#09090b", panel: "#111113", accent: "#f4f4f5" },
                { id: "nordic", name: "Nordic Slate", bg: "#0b0f19", panel: "#131c2e", accent: "#38bdf8" },
                { id: "oled", name: "OLED Pitch", bg: "#000000", panel: "#090909", accent: "#ffffff" },
                { id: "alabaster", name: "Alabaster Stone", bg: "#fbfbfa", panel: "#ffffff", accent: "#1c1917" },
                { id: "emerald", name: "Emerald Mint", bg: "#022c22", panel: "#033f30", accent: "#34d399" },
              ].map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-3 border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isActive ? "border-zinc-300 bg-zinc-800/20" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                    }`}
                    style={{ minHeight: "80px", borderRadius: 0 }}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-semibold text-white">{t.name}</span>
                      {isActive && <CheckCircle2 size={12} className="text-zinc-300" />}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.bg }} title="Background" />
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.panel }} title="Panel" />
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.accent }} title="Accent" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Typography Selector */}
        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <label className="row-label">Active Font Family</label>
            <select
              value={font}
              onChange={(e) => handleSelectFont(e.target.value)}
              className="minimal-select"
              style={{ background: "var(--background)", color: "var(--foreground)", fontSize: "1.05rem", padding: "6px 0" }}
            >
              <option value="geist">Geist (Minimal Sans-Serif)</option>
              <option value="outfit">Outfit (Geometric Modern)</option>
              <option value="jakarta">Plus Jakarta Sans (Elegant Accent)</option>
              <option value="inter">Inter (Classic Balanced)</option>
              <option value="fira">Fira Code (Monospace Typewriter)</option>
              <option value="custom">Custom Web Font...</option>
            </select>
          </div>
        </div>

        {/* Custom Font Config URL & Family (only if font === "custom") */}
        {font === "custom" && (
          <div className="settings-form-row">
            <span className="row-num">03 /</span>
            <div className="row-content animate-fade-down">
              <label className="row-label">Google Font / Stylesheet URL</label>
              <input
                type="text"
                className="minimal-input text-xs font-mono"
                placeholder="e.g. https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap"
                value={prefs.customFontUrl || ""}
                onChange={(e) => handlePrefChange("customFontUrl", e.target.value)}
              />
              <span className="text-[10px] text-zinc-500 font-mono block mt-1">URL to the stylesheet.</span>
              
              <label className="row-label mt-4">Font Family Name Override</label>
              <input
                type="text"
                className="minimal-input text-xs font-mono"
                placeholder="e.g. 'Playfair Display', serif"
                value={prefs.customFontFamily || ""}
                onChange={(e) => handlePrefChange("customFontFamily", e.target.value)}
              />
              <span className="text-[10px] text-zinc-500 font-mono block mt-1">Font family name used in CSS rules.</span>
            </div>
          </div>
        )}

        {/* Font size scale slider */}
        <div className="settings-form-row">
          <span className="row-num">04 /</span>
          <div className="row-content">
            <label className="row-label flex justify-between">
              <span>Font Size Scale</span>
              <span className="text-xs text-white font-semibold font-mono">{prefs.fontSize}px</span>
            </label>
            <input
              type="range"
              min="12"
              max="18"
              step="1"
              value={prefs.fontSize}
              onChange={(e) => handlePrefChange("fontSize", parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>

        {/* Layout density swatches */}
        <div className="settings-form-row">
          <span className="row-num">05 /</span>
          <div className="row-content">
            <label className="row-label">Layout Density</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { id: "compact", name: "Compact", desc: "Dense layout" },
                { id: "cozy", name: "Cozy", desc: "Standard spacing" },
                { id: "spacious", name: "Spacious", desc: "Open margins" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handlePrefChange("layoutDensity", d.id)}
                  className={`p-3 border text-left cursor-pointer transition-all ${
                    prefs.layoutDensity === d.id ? "bg-zinc-800/20 border-zinc-500" : "bg-transparent border-zinc-800 hover:border-zinc-700"
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <span className="text-xs font-semibold text-white block">{d.name}</span>
                  <span className="text-[9px] text-zinc-500 leading-tight mt-1 block font-mono">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Alignment */}
        <div className="settings-form-row">
          <span className="row-num">06 /</span>
          <div className="row-content">
            <label className="row-label">Sidebar Alignment</label>
            <div className="flex gap-6 py-2">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer font-mono">
                <input
                  type="radio"
                  name="sidebarPosition"
                  checked={prefs.sidebarPosition === "left"}
                  onChange={() => handlePrefChange("sidebarPosition", "left")}
                  className="accent-zinc-400"
                />
                <span>Left Docked</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer font-mono">
                <input
                  type="radio"
                  name="sidebarPosition"
                  checked={prefs.sidebarPosition === "right"}
                  onChange={() => handlePrefChange("sidebarPosition", "right")}
                  className="accent-zinc-400"
                />
                <span>Right Docked</span>
              </label>
            </div>
          </div>
        </div>

        {/* LinkedIn preview identity configuration */}
        <div className="settings-form-row">
          <span className="row-num">07 /</span>
          <div className="row-content">
            <label className="row-label">Preview Identity Profile Name</label>
            <input
              type="text"
              className="minimal-input text-xs"
              placeholder="e.g. Jane Doe"
              value={prefs.linkedinName}
              onChange={(e) => handlePrefChange("linkedinName", e.target.value)}
            />
            
            <label className="row-label mt-4">Preview Professional Headline</label>
            <input
              type="text"
              className="minimal-input text-xs"
              placeholder="e.g. CEO @ TechSaaS | Ghostwriter"
              value={prefs.linkedinHeadline}
              onChange={(e) => handlePrefChange("linkedinHeadline", e.target.value)}
            />
            
            <label className="row-label mt-4">Preview Avatar Emoji / Character</label>
            <input
              type="text"
              maxLength={2}
              className="minimal-input w-24 text-center text-xs font-bold font-mono"
              placeholder="💡"
              value={prefs.linkedinAvatar}
              onChange={(e) => handlePrefChange("linkedinAvatar", e.target.value)}
            />
          </div>
        </div>

        {/* Auto copy to clipboard & show animations toggles */}
        <div className="settings-form-row">
          <span className="row-num">08 /</span>
          <div className="row-content">
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-xs font-semibold text-white">Auto-copy Generated Post</span>
                <span className="text-[10px] text-zinc-500 font-mono">Automatically copy synthesized posts to system clipboard.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={prefs.autoCopyToClipboard}
                  onChange={(e) => handlePrefChange("autoCopyToClipboard", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-form-row">
          <span className="row-num">09 /</span>
          <div className="row-content">
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col gap-0.5 font-sans">
                <span className="text-xs font-semibold text-white">Enable UI Transitions</span>
                <span className="text-[10px] text-zinc-500 font-mono">Use Framer Motion animation effects for smooth fading panels.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={prefs.showTransitions ?? true}
                  onChange={(e) => handlePrefChange("showTransitions", e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Custom CSS overrides */}
        <div className="settings-form-row">
          <span className="row-num">10 /</span>
          <div className="row-content">
            <label className="row-label flex items-center gap-1.5">
              <Code size={13} />
              <span>Advanced Custom CSS Overrides</span>
            </label>
            <textarea
              value={cssOverride}
              onChange={handleCssChange}
              className="minimal-input font-mono text-xs mt-2"
              placeholder="/* Inject style rules here */&#10;.sidebar { border-right: 1px solid var(--border-muted); }"
              style={{ minHeight: "100px", lineHeight: "1.4", fontSize: "0.85rem" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
