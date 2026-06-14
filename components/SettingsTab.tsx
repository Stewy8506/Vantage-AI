"use client";

import { useState } from "react";
import { Key, Globe, ShieldCheck, CheckCircle2, XCircle, Loader2, Info, Eye, EyeOff, Save, Palette, Type, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SettingsTab({
  apiKeys,
  onSave,
  customCss,
  onSaveCustomCss,
}: {
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  customCss: string;
  onSaveCustomCss: (css: string) => void;
}) {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; msg: string } | undefined }>({});
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "obsidian";
    }
    return "obsidian";
  });

  const [font, setFont] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.getAttribute("data-font") || "geist";
    }
    return "geist";
  });

  const [cssOverride, setCssOverride] = useState(customCss);

  const [prevCustomCss, setPrevCustomCss] = useState(customCss);
  if (customCss !== prevCustomCss) {
    setPrevCustomCss(customCss);
    setCssOverride(customCss);
  }

  const [prevApiKeys, setPrevApiKeys] = useState(apiKeys);
  if (apiKeys !== prevApiKeys) {
    setPrevApiKeys(apiKeys);
    setKeys(apiKeys);
  }

  const handleSelectTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  const handleSelectFont = (selectedFont: string) => {
    setFont(selectedFont);
    document.documentElement.setAttribute("data-font", selectedFont);
    localStorage.setItem("font", selectedFont);
  };

  const handleCssChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCss = e.target.value;
    setCssOverride(nextCss);
    onSaveCustomCss(nextCss);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newKeys = { ...keys, [name]: value };
    setKeys(newKeys);
    onSave(newKeys);
  };

  const toggleShowKey = (field: string) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    onSave(keys);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const testConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult((prev) => ({ ...prev, [provider]: undefined }));

    let apiKey = "";
    let customUrl = "";

    if (provider === "gemini") apiKey = keys.gemini;
    if (provider === "openai") apiKey = keys.openai;
    if (provider === "anthropic") apiKey = keys.anthropic;
    if (provider === "openrouter") apiKey = keys.openrouter;
    if (provider === "ollama") customUrl = keys.ollamaUrl || "http://localhost:11434";
    if (provider === "lmstudio") customUrl = keys.lmStudioUrl || "http://localhost:1234";
    if (provider === "custom") {
      customUrl = keys.customBaseUrl;
      apiKey = keys.customApiKey;
    }

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, customUrl }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.models && data.models.length > 0) {
        setTestResult((prev) => ({
          ...prev,
          [provider]: { success: true, msg: `Connected successfully! Found ${data.models.length} models.` },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [provider]: { success: false, msg: data.error || "Failed to fetch models." },
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection timed out.";
      setTestResult((prev) => ({
        ...prev,
        [provider]: { success: false, msg: message },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const renderTestStatus = (provider: string) => {
    const result = testResult[provider];
    if (testingProvider === provider) {
      return (
        <motion.span
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 font-medium"
        >
          <Loader2 className="animate-spin" size={12} /> Testing Connection...
        </motion.span>
      );
    }
    if (!result) return null;
    return result.success ? (
      <motion.span
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium"
      >
        <CheckCircle2 size={12} /> {result.msg}
      </motion.span>
    ) : (
      <motion.span
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium"
      >
        <XCircle size={12} /> {result.msg}
      </motion.span>
    );
  };

  return (
    <div className="anim-fade-up flex flex-col gap-6 max-w-4xl mx-auto" style={{ paddingBottom: "60px" }}>
      <div className="flex flex-col gap-2">
        <h2 style={{ fontSize: "1.45rem", fontWeight: 600, letterSpacing: "-0.02em" }} className="text-white">Credentials Manager</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)" }}>
          Store your API keys and endpoints securely. All credentials remain inside your browser and are never saved on a backend.
        </p>
      </div>

      <div className="grid-2">
        {/* Cloud Providers Card */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
            <Globe size={18} className="text-rose-500" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Cloud LLM Providers</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Google Gemini API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["gemini"] ? "text" : "password"}
                  name="gemini"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="AIzaSy..."
                  value={keys.gemini}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("gemini")}
                >
                  {showKeys["gemini"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("gemini")}>
                Test
              </button>
            </div>
            {renderTestStatus("gemini")}
          </div>

          <div className="form-group">
            <label className="form-label">OpenAI API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["openai"] ? "text" : "password"}
                  name="openai"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="sk-proj-..."
                  value={keys.openai}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("openai")}
                >
                  {showKeys["openai"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("openai")}>
                Test
              </button>
            </div>
            {renderTestStatus("openai")}
          </div>

          <div className="form-group">
            <label className="form-label">Anthropic API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["anthropic"] ? "text" : "password"}
                  name="anthropic"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="sk-ant-..."
                  value={keys.anthropic}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("anthropic")}
                >
                  {showKeys["anthropic"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("anthropic")}>
                Test
              </button>
            </div>
            {renderTestStatus("anthropic")}
          </div>
        </div>

        {/* Local & Router Providers Card */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
            <Key size={18} className="text-rose-500" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Local & Router Connections</h3>
          </div>

          <div className="form-group">
            <label className="form-label">OpenRouter API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["openrouter"] ? "text" : "password"}
                  name="openrouter"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="sk-or-v1-..."
                  value={keys.openrouter}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("openrouter")}
                >
                  {showKeys["openrouter"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("openrouter")}>
                Test
              </button>
            </div>
            {renderTestStatus("openrouter")}
          </div>

          <div className="form-group">
            <label className="form-label">Ollama API Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="ollamaUrl"
                className="form-input"
                placeholder="http://localhost:11434"
                value={keys.ollamaUrl}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("ollama")}>
                Test
              </button>
            </div>
            {renderTestStatus("ollama")}
          </div>

          <div className="form-group">
            <label className="form-label">LM Studio API Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="lmStudioUrl"
                className="form-input"
                placeholder="http://localhost:1234"
                value={keys.lmStudioUrl}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("lmstudio")}>
                Test
              </button>
            </div>
            {renderTestStatus("lmstudio")}
          </div>
        </div>
      </div>

      {/* Custom OpenAI Endpoint Panel */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
          <ShieldCheck size={18} className="text-rose-500" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Custom OpenAI-Compatible Endpoint</h3>
        </div>

        <div className="grid-2" style={{ gap: "20px" }}>
          <div className="form-group">
            <label className="form-label">Base URL</label>
            <input
              type="text"
              name="customBaseUrl"
              className="form-input"
              placeholder="e.g. https://api.together.xyz/v1"
              value={keys.customBaseUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key</label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type={showKeys["custom"] ? "text" : "password"}
                  name="customApiKey"
                  autoComplete="new-password"
                  className="form-input pr-10"
                  placeholder="Bearer Token..."
                  value={keys.customApiKey}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                  onClick={() => toggleShowKey("custom")}
                >
                  {showKeys["custom"] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="custom-btn custom-btn-secondary flex-shrink-0" style={{ width: "80px" }} onClick={() => testConnection("custom")}>
                Test
              </button>
            </div>
            {renderTestStatus("custom")}
          </div>
        </div>
      </div>

      {/* External Search & Grounding APIs */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
          <Globe size={18} className="text-rose-500" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">External Search & Grounding APIs</h3>
        </div>

        <div className="form-group">
          <label className="form-label">SerpApi API Key (Optional)</label>
          <div className="flex gap-2 w-full">
            <div className="relative flex-1">
              <input
                type={showKeys["serpapi"] ? "text" : "password"}
                name="serpapi"
                autoComplete="new-password"
                className="form-input pr-10"
                placeholder="Enter SerpApi key for highly accurate trending LinkedIn data..."
                value={keys.serpapi || ""}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center"
                onClick={() => toggleShowKey("serpapi")}
              >
                {showKeys["serpapi"] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <span className="text-xs text-zinc-500 mt-1.5 block">
            If provided, Virality Mapper will query Google Search organically via SerpApi for site:linkedin.com trends instead of using local fallback scrapers.
          </span>
        </div>
      </div>

      {/* Interface Customizer */}
      <div className="glass-panel p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--border-muted)", paddingBottom: "14px" }}>
          <Palette size={18} className="text-zinc-400" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }} className="text-white">Interface Customizer</h3>
        </div>

        {/* 5 Premium Themes Preset Grid */}
        <div className="flex flex-col gap-3">
          <label className="form-label">
            <Palette size={14} className="text-zinc-400" />
            <span>Theme Preset</span>
          </label>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            {[
              { id: "obsidian", name: "Obsidian", bg: "#09090b", panel: "#111113", accent: "#f4f4f5", desc: "Dark charcoal matte" },
              { id: "nordic", name: "Nordic Slate", bg: "#0b0f19", panel: "#131c2e", accent: "#38bdf8", desc: "Sleek slate blue" },
              { id: "oled", name: "OLED Black", bg: "#000000", panel: "#090909", accent: "#ffffff", desc: "Pure pitch black" },
              { id: "alabaster", name: "Alabaster", bg: "#fbfbfa", panel: "#ffffff", accent: "#1c1917", desc: "Warm stone light" },
              { id: "emerald", name: "Emerald", bg: "#022c22", panel: "#033f30", accent: "#34d399", desc: "Deep forest mint" },
            ].map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id)}
                  type="button"
                  className="flex flex-col gap-2 p-3 rounded-lg border text-left cursor-pointer transition-all hover:border-zinc-500 bg-zinc-950/20"
                  style={{
                    borderColor: isActive ? "var(--accent)" : "var(--border-muted)",
                    boxShadow: isActive ? "0 0 12px var(--accent-glow)" : "none",
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-white">{t.name}</span>
                    {isActive && <CheckCircle2 size={12} className="text-rose-400" style={{ color: "var(--accent)" }} />}
                  </div>
                  <div className="flex gap-1.5 my-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.bg }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.panel }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-zinc-800/40 block" style={{ backgroundColor: t.accent }} />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium leading-tight">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography family picker */}
        <div className="form-group max-w-sm">
          <label className="form-label">
            <Type size={14} className="text-zinc-400" />
            <span>Typography Family</span>
          </label>
          <select
            value={font}
            onChange={(e) => handleSelectFont(e.target.value)}
            className="form-input cursor-pointer"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            <option value="geist">Geist (Minimal Sans-Serif)</option>
            <option value="outfit">Outfit (Geometric Modern)</option>
            <option value="jakarta">Plus Jakarta Sans (Elegant Accent)</option>
            <option value="inter">Inter (Classic Balanced)</option>
          </select>
        </div>

        {/* Advanced CSS Custom overrides */}
        <div className="form-group">
          <label className="form-label">
            <Code size={14} className="text-zinc-400" />
            <span>Custom CSS Overrides</span>
          </label>
          <textarea
            value={cssOverride}
            onChange={handleCssChange}
            className="form-input font-mono"
            placeholder={`/* Write custom CSS overrides here. e.g. */\nbody {\n  font-size: 15px;\n}\n.sidebar {\n  border-right-color: var(--accent);\n}`}
            style={{ minHeight: "130px", fontSize: "0.82rem", lineHeight: "1.45" }}
          />
          <span className="text-xs text-zinc-500 mt-1 block">
            Injects styling modifications instantly into the workspace. All parameters persist locally inside the browser.
          </span>
        </div>
      </div>

      {/* Info Tip & Save Button Panel */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 flex items-start gap-3" style={{ background: "var(--panel-bg)", borderColor: "var(--border-muted)" }}>
          <Info size={16} className="text-zinc-400" style={{ marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "0.8rem", color: "var(--zinc-400)", lineHeight: 1.45 }}>
            <strong>Ollama & LM Studio Tip</strong>: Ensure you run the application in your local environment. If they are hosted on a different device or container, configure the dynamic host IP instead of localhost (e.g. <code>http://192.168.1.150:11434</code>).
          </p>
        </div>

        <div className="flex items-center gap-4 justify-end">
          <AnimatePresence>
            {saveSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Configuration saved successfully!
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            className="custom-btn custom-btn-accent flex items-center gap-2"
            style={{ width: "220px", height: "46px" }}
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
