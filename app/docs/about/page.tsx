"use client";

import React from "react";
import { BookOpen, ShieldCheck, Zap, Layers, RefreshCw, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPlatformPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <BookOpen size={24} className="text-zinc-400" />
          <span>About Platform</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          A detailed guide on Vantage AI's core writing engine, features, and system architecture.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          Standard large language models write LinkedIn content that looks dry, predictable, and artificial.
          They are filled with over-used buzzwords (<em>"in today's fast-paced world"</em>, <em>"thrilled to announce"</em>,
          <em>"delve"</em>, <em>"testament"</em>) and formatting styles that scream AI generator.
        </p>
        <p>
          <strong>Vantage AI</strong> was built to escape these templates. Instead of relying on a single AI pass,
          it places three distinct agent specialists inside a peer-critique debate arena, refines the text to make it more
          human, grounds it against live search trends, and simulates real-world reader personas to verify the copy.
        </p>
      </motion.div>

      <section>
        <h2 id="debate-arena">01 / Consensus Agent Debate Arena</h2>
        <p>
          The core generation engine utilizes a collaborative multi-agent architecture to draft and refine your copy:
        </p>
        <ul>
          <li><strong>01 / Drafting Phase</strong>: Three specialized agents (Hook Agent, Structure Agent, and Storyteller Agent) independently analyze your target topic and produce their own individual post variations.</li>
          <li><strong>02 / Peer Critique</strong>: The agents review each other&apos;s drafts. The Hook Agent evaluates attention-grabbing strength, the Structure Agent flags formatting clichés, and the Storyteller Agent tests readability.</li>
          <li><strong>03 / Refinement & Settle</strong>: A final settlement agent integrates the feedback points, resolves any debates, and outputs a refined publication that combines the strengths of all three perspectives.</li>
        </ul>
      </section>

      <section>
        <h2 id="trend-grounding">02 / Live Trend Grounding</h2>
        <p>
          To ensure your posts match active industry conversations, Vantage AI grounds generation prompts in real-time search queries:
        </p>
        <ul>
          <li><strong>Low-Latency Crawler Fallbacks</strong>: When search grounding is enabled, the system crawls DuckDuckGo and Yahoo search endpoints to gather recent keyword associations and trending hashtags.</li>
          <li><strong>SerpApi Integration</strong>: If you execute a SerpApi run, the platform executes structured Google or Yahoo search queries, ensuring highly accurate trend context is injected into the model prompts.</li>
        </ul>
      </section>

      <section>
        <h2 id="persona-matrix">03 / Audience Persona Simulation Matrix</h2>
        <p>
          Before publishing your draft, you can test it against simulated LinkedIn audience personas to evaluate performance metrics:
        </p>
        <ul>
          <li><strong>Skeptical CTO</strong>: Evaluates technical credibility and filters out buzzword-heavy marketing speak.</li>
          <li><strong>Metrics-Driven VC</strong>: Looks for business impact, scaling narratives, and quantitative results.</li>
          <li><strong>Hustling Solopreneur</strong>: Values actionable tips, templates, and high-value resource lists.</li>
          <li><strong>Developer Advocate</strong>: Rates community engagement, open-source focus, and developer accessibility.</li>
        </ul>
        <p>
          Each persona outputs scroll-stopping probability ratings and detailed qualitative critiques to help you adjust your copy.
        </p>
      </section>

      <section>
        <h2 id="rag-performance">04 / RAG Performance Loops</h2>
        <p>
          When you log organic metrics (likes, impressions, comments) for published items, Vantage AI closes the feedback loop:
        </p>
        <ul>
          <li><strong>Performance Indexing</strong>: Your best-performing posts are indexed inside your local browser database.</li>
          <li><strong>Prompt Injection</strong>: During subsequent generation runs, the system uses Retrieval-Augmented Generation (RAG) to inject these high-performing templates as few-shot examples, aligning the AI output style directly with your historically successful content.</li>
        </ul>
      </section>

      <section>
        <h2 id="local-first">05 / Local-First Privacy Model</h2>
        <p>
          All operations respect your hardware boundaries:
        </p>
        <ul>
          <li><strong>Zero Central Storage</strong>: Your posts, metrics, history, and preferences are saved only in your local browser&apos;s IndexedDB/localStorage databases.</li>
          <li><strong>Secure Client Keys</strong>: API keys are stored in client-side cookies or localStorage and travel to servers only when initiating generative requests.</li>
          <li><strong>Self-Hosting</strong>: You can host Vantage AI on private servers and run LLMs entirely locally using Ollama or LM Studio.</li>
        </ul>
      </section>
    </div>
  );
}
