"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <BookOpen size={24} className="text-zinc-400" />
          <span>Terms of Service</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Last Updated: June 15, 2026. Standard terms for application usage and self-hosting licenses.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          Welcome to <strong>Virality Mapper</strong>. By utilizing this client-side software workspace or self-hosting 
          the code repository, you agree to comply with the terms and agreements outlined below.
        </p>
      </motion.div>

      <section>
        <h2 id="licensing">01 / Software License</h2>
        <p>
          Virality Mapper is provided under a local workspace developer license. You are permitted to:
        </p>
        <ul>
          <li>Execute the application code in local browser sessions.</li>
          <li>Self-host the repository on private servers for individual or team copy drafting.</li>
          <li>Modify or adapt styling tokens and custom system prompts to tailor writing preferences.</li>
        </ul>
      </section>

      <section>
        <h2 id="acceptable-use">02 / Acceptable Use Policy</h2>
        <p>
          Since this is a client-side writing assistant, you are solely responsible for all content drafted and published using the platform. You agree:
        </p>
        <ul>
          <li>Not to configure local crawlers or search scrapers to execute high-volume scraping attacks against target websites.</li>
          <li>To respect rate-limiting protocols and API limits set by third-party model providers (Google, OpenAI, Anthropic, OpenRouter).</li>
          <li>Not to utilize the agent debate arena to synthesize hate speech, automated misinformation, or spam copy.</li>
        </ul>
      </section>

      <section>
        <h2 id="no-warranty">03 / Warranty Disclaimer</h2>
        <p>
          THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
          THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS 
          OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, 
          ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
        </p>
      </section>

      <section>
        <h2 id="termination">04 / Local Termination</h2>
        <p>
          You can terminate this agreement at any time by deleting the local repository, closing active browser tabs, and clearing 
          your cookies and localStorage history.
        </p>
      </section>
    </div>
  );
}
