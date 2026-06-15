"use client";

import React from "react";
import { ShieldCheck, HardDrive, EyeOff, Radio } from "lucide-react";
import { motion } from "framer-motion";

export default function DataHandlingSecurityPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <ShieldCheck size={24} className="text-zinc-400" />
          <span>Data Handling & Security</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Detailed audit of client-side encryption, search scraping endpoints, and custom API validation.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          Virality Mapper follows a strict local-first architectural model. We do not maintain databases to store your posts, 
          histories, or API configuration keys. Your personal hardware is the direct boundary of the application&apos;s data storage.
        </p>
      </motion.div>

      <section>
        <h2 id="client-encryption">01 / Client-Side Key Storage</h2>
        <p>
          API keys configured in the Settings dashboard are persisted using standard client-side technologies:
        </p>
        <ul>
          <li><strong>Storage Area</strong>: Keys are saved directly in your browser&apos;s <code>localStorage</code> database or secure local cookies.</li>
          <li><strong>Transmission Safety</strong>: Credentials travel exclusively from your browser to the select model endpoints (e.g. Google Gemini, Anthropic, or OpenAI API). They are never mirrored or uploaded to any central Virality Mapper telemetry databases.</li>
        </ul>
      </section>

      <section>
        <h2 id="ssrf-guards">02 / Server-Side Request Forgery (SSRF) Whitelisting</h2>
        <p>
          When deploying custom OpenAI API gateways or using local models (such as Ollama or LM Studio), the application employs 
          strict SSRF validation on the resolved base URLs:
        </p>
        <ul>
          <li><strong>Host Verification</strong>: Outgoing API URLs are parsed and tested against a domain whitelist to prevent malicious redirects or scanning of private networks.</li>
          <li><strong>Loopback Access</strong>: Connections to loopback addresses (such as <code>http://localhost:11434</code> or <code>http://127.0.0.1:1234</code>) are validated to ensure they conform to designated local LLM services only.</li>
        </ul>
      </section>

      <section>
        <h2 id="scraping-transmissions">03 / Trend Grounding and Scraper Privacy</h2>
        <p>
          To run live industry trends searches:
        </p>
        <ul>
          <li><strong>Scraper Inquiries</strong>: DuckDuckGo or Yahoo search wrappers pull live keywords from search suggestion nodes. Only public keywords and hashtags are sent to these services.</li>
          <li><strong>SerpApi Option</strong>: If configured, queries are routed securely to SerpApi with the corresponding credentials stored in your browser.</li>
        </ul>
      </section>

      <section>
        <h2 id="audit-trail">04 / Clear-All Command</h2>
        <p>
          To completely purge your credentials, custom personas, debate records, and cached metrics:
        </p>
        <ol>
          <li>Open the <strong>Settings Modal</strong> from the bottom of the sidebar.</li>
          <li>Navigate to the <strong>Admin Configurations</strong> tab.</li>
          <li>Trigger the <strong>Reset System Preferences</strong> option to instantly wipe all cookies, localStorage, and IndexedDB files associated with the application.</li>
        </ol>
      </section>
    </div>
  );
}
