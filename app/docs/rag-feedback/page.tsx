"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, HelpCircle, BookOpen, Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function RagFeedbackPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <RefreshCw size={24} className="text-zinc-400" />
          <span>RAG & Feedback Loops</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          How to ground future posts using your own high-performing published copy.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          AI models output generic templates because they lack a feedback loop. They do not know which posts
          actually performed well on your LinkedIn feed, resulting in repeated patterns.
        </p>
        <p>
          <strong>Vantage AI</strong> implements a client-side **Retrieval-Augmented Generation (RAG)** loop.
          By recording real performance analytics (views, likes, comments) from your published posts, the engine learns
          your personal writing style and references successful runs as examples for future drafts.
        </p>
      </motion.div>

      <section>
        <h2 id="how-the-rag-loop-works">01 / How the RAG Loop Works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          {[
            {
              step: "# 01 / Record Actual Metrics",
              desc: "After copying a draft and publishing it on LinkedIn, wait 48-72 hours. Navigate to your workspace **Review Tab**, expand the post context card, click **+ Record Actual Metrics**, and log your impressions, likes, and comments."
            },
            {
              step: "# 02 / Indexing & Scoring",
              desc: "The system runs a sorting index. Posts that surpass high engagement limits (based on weighted likes and comments) are categorized as **High-Performance Reference Templates**."
            },
            {
              step: "# 03 / Few-Shot Injections",
              desc: "When you start a new draft session, if the **Enable RAG** preference is toggled ON in Settings, the engine queries your local high-performance index. It fetches the text structure of your best posts and injects them directly into the system prompts as few-shot reference examples."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                borderLeft: "2px solid var(--accent)",
                paddingLeft: "20px",
                marginLeft: "8px"
              }}
            >
              <h3 style={{ margin: "0 0 6px", fontSize: "0.95rem", fontWeight: 700 }}>{item.step}</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-banner docs-banner-info">
        <div className="docs-banner-icon">
          <HelpCircle size={18} />
        </div>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700 }}># 04 / Activating the RAG Context</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
            To verify RAG templates are active: open **Settings Modal**, navigate to **Preferences**,
            and toggle **Enable RAG Context**. Make sure you have recorded performance data for at least 1-2 posts
            under the Review tab to give the model reference examples.
          </p>
        </div>
      </section>

      <section>
        <h2 id="local-storage-architecture">02 / Local Storage Architecture</h2>
        <p>
          All logged analytics and templates are saved locally on your device:
        </p>
        <ul>
          <li>Stored inside browser `localStorage` under `vm_master_config` key.</li>
          <li>No tracking scripts, metrics databases, or external analytics systems receive this information.</li>
          <li>You can back up your indexed posts at any time by exporting the configuration file under the settings menu.</li>
        </ul>
      </section>

    </div>
  );
}
