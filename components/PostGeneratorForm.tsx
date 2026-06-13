"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

export default function PostGeneratorForm({ onGenerate }: { onGenerate: (data: Variant[]) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    appName: "",
    description: "",
    targetAudience: "",
    tone: "Professional, punchy, engaging",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      onGenerate(data.data.variants);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 animate-fade-in" style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <div className="input-group">
        <label className="input-label" htmlFor="appName">App/Project Name</label>
        <input
          required
          type="text"
          id="appName"
          name="appName"
          className="input-field"
          placeholder="e.g., Virality Mapper"
          value={formData.appName}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="description">What does it do?</label>
        <textarea
          required
          id="description"
          name="description"
          className="input-field"
          placeholder="A short description of the core features and the main problem it solves."
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="targetAudience">Target Audience (Optional)</label>
        <input
          type="text"
          id="targetAudience"
          name="targetAudience"
          className="input-field"
          placeholder="e.g., Software Engineers, Founders"
          value={formData.targetAudience}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="tone">Desired Tone</label>
        <input
          type="text"
          id="tone"
          name="tone"
          className="input-field"
          placeholder="e.g., Provocative, Data-driven, Humorous"
          value={formData.tone}
          onChange={handleChange}
        />
      </div>

      {error && (
        <div className="mb-4 p-4" style={{ backgroundColor: "rgba(244, 63, 94, 0.1)", borderLeft: "4px solid var(--accent)", color: "#fda4af", borderRadius: "4px" }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <button type="submit" className="btn mt-4" style={{ width: "100%" }} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Analyzing LinkedIn Trends...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Generate Viral Posts
          </>
        )}
      </button>
    </form>
  );
}
