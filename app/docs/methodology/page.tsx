"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Terminal, ArrowRight, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function MethodologyPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <Cpu size={24} className="text-zinc-400" />
          <span>Agent Debate Arena</span>
        </h1>
        <p style={{ color: "var(--zinc-400)", fontSize: "0.95rem", marginTop: "8px", marginBottom: 0 }}>
          Deep-dive into the consensus engine, pipeline phases, and simulated focus group testing.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p>
          Unlike standard single-shot LLM generators, Virality Mapper operates as a multi-agent state machine. 
          It runs specialized sub-agents through structured phases of writing, critique, and revision before delivering the 
          final refined output.
        </p>
      </motion.div>

      <section>
        <h2 id="specialist-personas">01 / Specialist Personas</h2>
        <p>
          During the initial drafting phase, three specialist copywriters create distinct draft variations:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          {[
            {
              num: "01",
              title: "The Hook Specialist",
              role: "Focuses on hook archetypes (e.g. vulnerable failures, contrarian patterns, high-value resource stashes). Designed to break user scrolling and grab instant reader attention."
            },
            {
              num: "02",
              title: "The Structure Specialist",
              role: "Optimizes white space, layouts, line breaks, and typographic lists. Uses clear, bulleted metrics to make content readable and scannable on small mobile screens."
            },
            {
              num: "03",
              title: "The Narrative Storyteller",
              role: "Fills the body with real-world scenarios, professional vulnerabilities, and analogies. Focuses on authentic brand communication and emotional storytelling."
            }
          ].map((agent) => (
            <div 
              key={agent.num}
              style={{
                border: "1px solid var(--border-muted)",
                backgroundColor: "var(--panel-bg-solid)",
                padding: "16px 20px",
                borderRadius: "6px",
                display: "flex",
                gap: "16px"
              }}
            >
              <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--zinc-500)", fontWeight: 700 }}>{agent.num} /</span>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 600 }}># {agent.num} / {agent.title}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.5 }}>{agent.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 id="stepper-consensus-pipeline">02 / Stepper Consensus Pipeline</h2>
        <p>
          The generation cycle flows sequentially through five pipeline phases:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          {[
            { step: "Phase 01: Grounding", desc: "Retrieve active search keywords and templates from RAG memory to align variables with user settings." },
            { step: "Phase 02: Drafting", desc: "Specialist agents propose their drafts, showcasing their specific formatting traits (hooks vs numbers vs narrative story)." },
            { step: "Phase 03: Peer Critique", desc: "The agents review each other's work and flag issues like marketing jargon, weak call-to-actions, or poor formatting." },
            { step: "Phase 04: Refinement", desc: "Agents receive peer reviews and update their drafts. Unnecessary words are pruned and readability is checked." },
            { step: "Phase 05: Settle", desc: "A synthesis model merges the best elements into a single cohesive copy, ready to publish." }
          ].map((phase, idx) => (
            <div 
              key={idx}
              style={{
                display: "flex",
                gap: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border-muted)"
              }}
            >
              <div style={{ color: "var(--accent)" }}><Activity size={14} style={{ marginTop: "2px" }} /></div>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "var(--zinc-200)" }}>{phase.step}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.5 }}>{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 id="simulated-focus-group">03 / Simulated Focus Group</h2>
        <p>
          After the consensus model settles, the refined post is tested against a simulated panel of LinkedIn reader personas:
        </p>
        <div 
          style={{
            border: "1px solid var(--border-muted)",
            backgroundColor: "var(--panel-bg-solid)",
            padding: "20px",
            borderRadius: "6px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start"
          }}
        >
          <div style={{ color: "var(--accent)" }}><Users size={16} style={{ marginTop: "2px" }} /></div>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: "0.95rem", fontWeight: 600 }}># 01 / Persona Scoring Metrics</h3>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.85rem", color: "var(--zinc-400)", lineHeight: 1.6 }}>
              <li><strong>Venture Capitalist (VC)</strong>: Values contrarian insights, bold industry predictions, and structured data metrics.</li>
              <li><strong>Software Engineer (CTO)</strong>: Ignores marketing speak; scores content based on technical accuracy, clean explanations, and utility.</li>
              <li><strong>Founder / Executive</strong>: Searches for vulnerability, growth strategies, and real-world failure analyses.</li>
            </ul>
            <p style={{ margin: "12px 0 0", fontSize: "0.825rem", color: "var(--zinc-500)" }}>
              The simulator returns three scores: <strong>Scroll-Stopping Probability</strong> (hook efficiency), 
              <strong>Engagement Level</strong> (readability), and <strong>Virality Ratio</strong> (likelihood to share).
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
