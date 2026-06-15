"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, BookOpen, Terminal, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SelfHostingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <ShieldAlert size={24} className="text-zinc-400" />
          <span>Self-Hosting & API</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Guide to deploying Virality Mapper on local servers, connecting to local LLMs, and understanding security guards.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          Virality Mapper can be run entirely in self-hosted environments. You can configure global API keys and base URLs 
          using server environment variables or browser settings, allowing local multi-agent copy generation 
          using models on your machine.
        </p>
      </motion.div>

      <section>
        <h2 id="quickstart-local-install">01 / Quickstart Local Install</h2>
        <p>To run the application locally, clone the repository and configure dependencies:</p>
        <pre>
          <code>{`# Clone the repository
git clone https://github.com/anuvabdas/Virality-Mapper.git
cd Virality-Mapper

# Install packages
npm install

# Run the development server
npm run dev`}</code>
        </pre>
        <p>The app will start on <strong style={{ color: "var(--accent)" }}>http://localhost:3000</strong>.</p>
      </section>

      <section>
        <h2 id="environment-variables">02 / Environment Variables</h2>
        <p>
          Instead of entering API credentials in the browser settings modal, you can configure them server-side inside 
          a `.env.local` file:
        </p>
        <pre>
          <code>{`# LLM Provider Keys
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Local Models Connection
OLLAMA_URL=http://localhost:11434
LM_STUDIO_URL=http://localhost:1234

# Scraper Grounding
SERPAPI_KEY=your_serpapi_key`}</code>
        </pre>
      </section>

      <section>
        <h2 id="local-llm-integration">03 / Local LLM Integration (Ollama / LM Studio)</h2>
        <p>
          To connect to a locally running model:
        </p>
        <ol>
          <li>
            <strong>Ollama</strong>: Start Ollama on your machine. Ensure it is listening on port 11434. 
            Confirm the models you want to use (such as `llama3` or `mistral`) are pulled:
            <pre><code>ollama pull llama3</code></pre>
          </li>
          <li>
            <strong>LM Studio</strong>: Open LM Studio, select your model, navigate to the **Local Server** tab, 
            and start the server on port 1234.
          </li>
          <li>
            <strong>Settings Modal</strong>: In the Virality Mapper workspace, open **Settings → API Connections**, 
            select local providers, and confirm the base URL connection is running.
          </li>
        </ol>
      </section>

      <section className="docs-banner docs-banner-warning">
        <div className="docs-banner-icon">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700 }}># 01 / SSRF & Request Forgery Guards</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
            To prevent SSRF (Server-Side Request Forgery) attacks in outgoing HTTP queries, Virality Mapper enforces 
            strict base URL filtering before issuing client calls. Any configured URLs that use non-HTTP/HTTPS protocols, 
            contain credentials/passwords, or attempt to resolve cloud metadata hosts (`169.254.169.254`, `metadata.google.internal`) 
            are blocked.
          </p>
        </div>
      </section>

    </div>
  );
}
