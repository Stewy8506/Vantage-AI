"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <ShieldCheck size={24} className="text-zinc-400" />
          <span>Privacy Policy</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Last Updated: June 15, 2026. Data handling, local storage, and client-side encryption policy.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          At <strong>Vantage AI</strong>, we prioritize user privacy above all else. This application is designed with a
          <strong> local-first architecture</strong>, meaning that your data, API credentials, prompts, and drafted publications
          remain stored directly on your personal computer, not on external server databases.
        </p>
      </motion.div>

      <section>
        <h2 id="data-collection">01 / Data Storage and Key Encryption</h2>
        <p>
          We do not operate central database systems to track your text drafts or credentials. Here is how your data is segmented and stored:
        </p>
        <ul>
          <li><strong>API Credentials</strong>: API keys for Google Gemini, OpenAI, Anthropic, OpenRouter, and SerpApi are saved on your local browser using client-side <code>localStorage</code> or secure local cookies. They are decrypted only on demand to execute generation runs.</li>
          <li><strong>Draft History</strong>: Saved LinkedIn posts and associated audit trail records (agent debate transcripts, metrics logs, and critiques) are persisted exclusively in your browser&apos;s indexed storage. Removing browser cookies/data will erase this history.</li>
        </ul>
      </section>

      <section>
        <h2 id="external-requests">02 / Third-Party API Transmissions</h2>
        <p>
          To compile trends and draft content, the application transmits data to selected external endpoints:
        </p>
        <ul>
          <li><strong>LLM Providers</strong>: When conducting generation runs, requests are sent to the corresponding APIs (such as OpenAI, Anthropic, Google, or OpenRouter) based on the configurations you select. Only the context prompt is sent.</li>
          <li><strong>Search Crawler Queries</strong>: Trend inquiries utilize third-party scrapers (DuckDuckGo, Yahoo) or SerpApi to pull live trends. Your target industry terms are passed through to retrieve recent public search suggestions.</li>
          <li><strong>Local Endpoints</strong>: Connections made to Ollama or LM Studio remain completely local inside your loopback network (e.g., <code>http://localhost:11434</code>) and do not pass through any external servers.</li>
        </ul>
      </section>

      <section>
        <h2 id="data-security">03 / Security Audits</h2>
        <p>
          We employ strict Request Forgery (SSRF) filters. Incoming target base URLs for local or custom API integrations are run against a domain whitelist to prevent malicious local network scans or system token theft.
        </p>
      </section>

      <section>
        <h2 id="user-rights">04 / User Rights and Controls</h2>
        <p>
          Since all data is stored locally, you hold complete sovereignty over your information. You can wipe all credentials, drafts, and historical records at any time by clearing your browser cache for this website, or by toggling options inside the Settings dashboard.
        </p>
      </section>
    </div>
  );
}
