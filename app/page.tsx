"use client";

import { useState } from "react";
import PostGeneratorForm from "@/components/PostGeneratorForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { Sparkles } from "lucide-react";

interface Variant {
  id: number;
  style: string;
  content: string;
  score: number;
  critique: string;
}

export default function Home() {
  const [variants, setVariants] = useState<Variant[]>([]);

  return (
    <main className="container flex-col items-center justify-center min-h-screen">
      {/* Background visual effects */}
      <div className="bg-blob"></div>
      <div className="bg-blob-2"></div>

      <div className="text-center animate-fade-in" style={{ marginBottom: "40px" }}>
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="glass p-2" style={{ borderRadius: "12px", display: "inline-flex", background: "rgba(109, 40, 217, 0.2)", border: "1px solid rgba(109, 40, 217, 0.3)" }}>
            <Sparkles style={{ color: "var(--primary)" }} size={24} />
          </div>
        </div>
        <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "16px", lineHeight: 1.2 }}>
          Virality <span className="text-gradient">Mapper</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#a1a1aa", maxWidth: "600px", margin: "0 auto" }}>
          Analyze top LinkedIn trends in real-time and generate highly optimized, viral posts for your next big launch.
        </p>
      </div>

      <PostGeneratorForm onGenerate={(data) => setVariants(data)} />
      
      {variants.length > 0 && <ResultsDisplay variants={variants} />}
    </main>
  );
}
