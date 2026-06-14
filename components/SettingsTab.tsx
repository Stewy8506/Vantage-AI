"use client";

import { useState, useEffect } from "react";
import { Key, Globe, ShieldCheck, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";

interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  openrouter: string;
  ollamaUrl: string;
  lmStudioUrl: string;
  customBaseUrl: string;
  customApiKey: string;
}

export default function SettingsTab({
  apiKeys,
  onSave,
}: {
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}) {
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; msg: string } }>({});

  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...keys, [name]: value };
    setKeys(updated);
    onSave(updated);
  };

  const testConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult((prev) => ({ ...prev, [provider]: undefined as any }));

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
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [provider]: { success: false, msg: err.message || "Connection timed out." },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const renderTestStatus = (provider: string) => {
    const result = testResult[provider];
    if (testingProvider === provider) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 font-medium">
          <Loader2 className="animate-spin" size={12} /> Testing Connection...
        </span>
      );
    }
    if (!result) return null;
    return result.success ? (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
        <CheckCircle2 size={12} /> {result.msg}
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium">
        <XCircle size={12} /> {result.msg}
      </span>
    );
  };

  return (
    <div className="anim-fade-up flex flex-col gap-6 max-w-4xl mx-auto" style={{ paddingBottom: "40px" }}>
      <div className="flex flex-col gap-2">
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Credentials Manager</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--zinc-400)" }}>
          Store your API keys and endpoints securely. All credentials remain inside your browser and are never saved on a backend.
        </p>
      </div>

      <div className="grid-2">
        {/* Cloud Providers Card */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "10px" }}>
            <Globe size={18} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Cloud LLM Providers</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Google Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                name="gemini"
                className="form-input"
                placeholder="AIzaSy..."
                value={keys.gemini}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("gemini")}>
                Test
              </button>
            </div>
            {renderTestStatus("gemini")}
          </div>

          <div className="form-group">
            <label className="form-label">OpenAI API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                name="openai"
                className="form-input"
                placeholder="sk-proj-..."
                value={keys.openai}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("openai")}>
                Test
              </button>
            </div>
            {renderTestStatus("openai")}
          </div>

          <div className="form-group">
            <label className="form-label">Anthropic API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                name="anthropic"
                className="form-input"
                placeholder="sk-ant-..."
                value={keys.anthropic}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("anthropic")}>
                Test
              </button>
            </div>
            {renderTestStatus("anthropic")}
          </div>
        </div>

        {/* Local & Router Providers Card */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "10px" }}>
            <Key size={18} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Local & Router Connections</h3>
          </div>

          <div className="form-group">
            <label className="form-label">OpenRouter API Key (Groq, DeepSeek, etc.)</label>
            <div className="flex gap-2">
              <input
                type="password"
                name="openrouter"
                className="form-input"
                placeholder="sk-or-v1-..."
                value={keys.openrouter}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("openrouter")}>
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
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("ollama")}>
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
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("lmstudio")}>
                Test
              </button>
            </div>
            {renderTestStatus("lmstudio")}
          </div>
        </div>
      </div>

      {/* Custom OpenAI Endpoint Panel */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2" style={{ borderBottom: "1px solid var(--zinc-800)", paddingBottom: "10px" }}>
          <ShieldCheck size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Custom OpenAI-Compatible Endpoint</h3>
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
            <div className="flex gap-2">
              <input
                type="password"
                name="customApiKey"
                className="form-input"
                placeholder="Bearer Token..."
                value={keys.customApiKey}
                onChange={handleChange}
              />
              <button className="custom-btn custom-btn-secondary" onClick={() => testConnection("custom")}>
                Test
              </button>
            </div>
            {renderTestStatus("custom")}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 flex items-start gap-3" style={{ background: "rgba(244, 63, 94, 0.03)", borderColor: "rgba(244, 63, 94, 0.1)" }}>
        <Info size={16} style={{ color: "var(--accent)", marginTop: "2px" }} />
        <p style={{ fontSize: "0.8rem", color: "var(--zinc-400)", lineHeight: 1.4 }}>
          <strong>Ollama & LM Studio Tip</strong>: Ensure you run the application in your local environment. If they are hosted on a different device or container, configure the dynamic host IP instead of localhost (e.g. <code>http://192.168.1.150:11434</code>).
        </p>
      </div>
    </div>
  );
}
