import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Helper to sanitize and robustly parse JSON from LLM responses
function robustJsonParse(text: string): any {
  let cleanText = text.trim();
  
  // Remove markdown code blocks if present
  if (cleanText.includes("```")) {
    const matches = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (matches && matches[1]) {
      cleanText = matches[1].trim();
    }
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // If standard parsing fails, try to find the first '{' and last '}'
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const candidate = cleanText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        throw new Error(`Failed to parse response as JSON. Raw: ${text}`);
      }
    }
    throw new Error(`No JSON object found in response. Raw: ${text}`);
  }
}

async function callLLM(
  provider: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  apiKeys: any
): Promise<any> {
  const cleanTemp = Math.max(0, Math.min(1, temperature));

  switch (provider) {
    case "gemini": {
      if (!apiKeys?.gemini) throw new Error("Gemini API Key is missing.");
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: cleanTemp,
          responseMimeType: "application/json",
        },
      });
      const parsed = robustJsonParse(response.text || "{}");
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "openai": {
      if (!apiKeys?.openai) throw new Error("OpenAI API Key is missing.");
      const openai = new OpenAI({ apiKey: apiKeys.openai });
      const response = await openai.chat.completions.create({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: cleanTemp,
        response_format: { type: "json_object" },
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "anthropic": {
      if (!apiKeys?.anthropic) throw new Error("Anthropic API Key is missing.");
      const anthropic = new Anthropic({ apiKey: apiKeys.anthropic });
      const response = await anthropic.messages.create({
        model: model || "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.`,
          },
        ],
        temperature: cleanTemp,
      });

      let text = "";
      if (response.content && response.content[0] && response.content[0].type === "text") {
        text = response.content[0].text;
      }
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "openrouter": {
      if (!apiKeys?.openrouter) throw new Error("OpenRouter API Key is missing.");
      const openai = new OpenAI({
        apiKey: apiKeys.openrouter,
        baseURL: "https://openrouter.ai/api/v1",
      });
      const response = await openai.chat.completions.create({
        model: model || "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: cleanTemp,
        response_format: { type: "json_object" },
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "ollama": {
      const baseURL = `${apiKeys?.ollamaUrl || "http://localhost:11434"}/v1`;
      const openai = new OpenAI({
        apiKey: "ollama",
        baseURL,
      });
      const response = await openai.chat.completions.create({
        model: model || "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "lmstudio": {
      const baseURL = `${apiKeys?.lmStudioUrl || "http://localhost:1234"}/v1`;
      const openai = new OpenAI({
        apiKey: "lmstudio",
        baseURL,
      });
      const response = await openai.chat.completions.create({
        model: model || "model-identifier",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    case "custom": {
      if (!apiKeys?.customBaseUrl) throw new Error("Custom OpenAI endpoint URL is missing.");
      const openai = new OpenAI({
        apiKey: apiKeys.customApiKey || "custom",
        baseURL: apiKeys.customBaseUrl,
      });
      const response = await openai.chat.completions.create({
        model: model || "custom-model",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCRITICAL: Respond with a raw, valid JSON object matching the format. Do not wrap in markdown backticks, and do not add conversational preamble.` },
        ],
        temperature: cleanTemp,
      });
      const text = response.choices[0].message.content || "{}";
      const parsed = robustJsonParse(text);
      return parsed.variants ? parsed.variants[0] : parsed;
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function searchLinkedInTrends(query: string): Promise<string[]> {
  try {
    const searchQuery = `site:linkedin.com ${query} post`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });

    if (!res.ok) {
      console.warn(`DuckDuckGo returned status ${res.status}`);
      return [];
    }

    const html = await res.text();
    const snippets: string[] = [];

    // Extract DuckDuckGo HTML snippets:
    // Typical format: <a class="result__snippet" ...>Snippet content</a>
    const regex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = regex.exec(html)) !== null && snippets.length < 5) {
      let snippet = match[1]
        .replace(/<[^>]*>/g, "") // strip HTML tags
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
      if (snippet) snippets.push(snippet);
    }

    // Fallback in case class names differ
    if (snippets.length === 0) {
      const fallbackRegex = /<div class="result__snippet"[^>]*>([\s\S]*?)<\/div>/gi;
      while ((match = fallbackRegex.exec(html)) !== null && snippets.length < 5) {
        let snippet = match[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/\s+/g, " ")
          .trim();
        if (snippet) snippets.push(snippet);
      }
    }

    return snippets;
  } catch (err) {
    console.error("DuckDuckGo fetch failed:", err);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { appName, description, targetAudience, tone, apiKeys, agents } = await req.json();

    if (!appName || !description) {
      return NextResponse.json(
        { error: "App Name and Description are required" },
        { status: 400 }
      );
    }

    const activeAgents = agents || [];
    if (activeAgents.length < 3) {
      return NextResponse.json(
        { error: "This debate flow requires exactly 3 configured agents." },
        { status: 400 }
      );
    }

    const [agentA, agentB, agentC] = activeAgents;

    // Step 1: Live Web Search insights
    const searchQuery = `${appName} ${targetAudience || ""}`.trim();
    const liveTrends = await searchLinkedInTrends(searchQuery);

    const trendsContext = liveTrends.length > 0
      ? `Real-time trending search insights related to this topic:\n${liveTrends.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "No live post search trends retrieved. Fall back to general LinkedIn copy guidelines: Use hook pattern interrupts, short paragraphs, lists, bold metrics, and a clean call to action.";

    // Helper to run LLM with clean error boundaries
    const runAgentCall = async (agent: any, systemPrompt: string, userPrompt: string) => {
      try {
        return await callLLM(
          agent.provider,
          agent.model,
          agent.systemPrompt + "\n\n" + systemPrompt,
          userPrompt,
          agent.temperature,
          apiKeys
        );
      } catch (err: any) {
        throw new Error(`[${agent.name} (${agent.provider}/${agent.model})] call failed: ${err.message || err}`);
      }
    };

    // Step 2: Phase 1 (Drafting)
    const draftUserPrompt = `
Generate a viral LinkedIn post draft for the following project.
Context:
- App/Project Name: ${appName}
- Description: ${description}
- Target Audience: ${targetAudience || 'General Professionals'}
- Tone: ${tone || 'Professional yet engaging'}

LinkedIn Search Context:
${trendsContext}

CRITICAL FORMAT REQUIREMENT:
You must output a JSON object containing the exact properties: "content" and "hookExplanation".
Example:
{
  "content": "The post content...",
  "hookExplanation": "Why this scroll-stopping hook is designed to capture the target audience."
}
`;

    const [draftA, draftB, draftC] = await Promise.all([
      runAgentCall(agentA, "You are drafting an initial viral LinkedIn post.", draftUserPrompt),
      runAgentCall(agentB, "You are drafting an initial viral LinkedIn post.", draftUserPrompt),
      runAgentCall(agentC, "You are drafting an initial viral LinkedIn post.", draftUserPrompt)
    ]);

    // Step 3: Phase 2 (Bidirectional Critique Round)
    // 1->2, 2->1, 2->3, 3->2, 1->3, 3->1
    const [critiqueAtoB, critiqueBtoA, critiqueBtoC, critiqueCtoB, critiqueAtoC, critiqueCtoA] = await Promise.all([
      // Agent A critiques Draft B (1 -> 2)
      runAgentCall(agentA, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Beta:\n"${draftB.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`),
      // Agent B critiques Draft A (2 -> 1)
      runAgentCall(agentB, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Alpha:\n"${draftA.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`),
      // Agent B critiques Draft C (2 -> 3)
      runAgentCall(agentB, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Gamma:\n"${draftC.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`),
      // Agent C critiques Draft B (3 -> 2)
      runAgentCall(agentC, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Beta:\n"${draftB.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`),
      // Agent A critiques Draft C (1 -> 3)
      runAgentCall(agentA, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Gamma:\n"${draftC.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`),
      // Agent C critiques Draft A (3 -> 1)
      runAgentCall(agentC, "You are a reviewer critiquing a draft written by your peer.", `Evaluate this draft written by Agent Alpha:\n"${draftA.content}"\n\nProvide constructive, sharp critique and a rating out of 100.\n\nCRITICAL FORMAT:\n{\n  "critique": "...",\n  "score": 80\n}`)
    ]);

    // Step 4: Phase 3 (Refinement based on critiques)
    // Agent Alpha refines using Beta and Gamma critiques
    const refinePromptA = `
You wrote the following initial LinkedIn post draft:
---
${draftA.content}
---

Your peer Agent Beta gave you this critique:
"${critiqueBtoA.critique}" (Score: ${critiqueBtoA.score}/100)

Your peer Agent Gamma gave you this critique:
"${critiqueCtoA.critique}" (Score: ${critiqueCtoA.score}/100)

Please refine your draft to make it the absolute best, incorporating their feedback where valid. Ensure it remains true to your unique copywriting style.
Output a JSON object with your refined post content and an explanation of the arguments/changes you made.

CRITICAL FORMAT REQUIREMENT:
Output a JSON object with properties 'content', 'score' and 'argument'.
Example:
{
  "content": "Your refined post...",
  "score": 92,
  "argument": "I adjusted the hook because..."
}
`;

    // Agent Beta refines using Alpha and Gamma critiques
    const refinePromptB = `
You wrote the following initial LinkedIn post draft:
---
${draftB.content}
---

Your peer Agent Alpha gave you this critique:
"${critiqueAtoB.critique}" (Score: ${critiqueAtoB.score}/100)

Your peer Agent Gamma gave you this critique:
"${critiqueCtoB.critique}" (Score: ${critiqueCtoB.score}/100)

Please refine your draft to make it the absolute best, incorporating their feedback where valid. Ensure it remains true to your unique copywriting style.
Output a JSON object with your refined post content and an explanation of the arguments/changes you made.

CRITICAL FORMAT REQUIREMENT:
Output a JSON object with properties 'content', 'score' and 'argument'.
Example:
{
  "content": "Your refined post...",
  "score": 92,
  "argument": "I adjusted the hook because..."
}
`;

    // Agent Gamma refines using Alpha and Beta critiques
    const refinePromptC = `
You wrote the following initial LinkedIn post draft:
---
${draftC.content}
---

Your peer Agent Alpha gave you this critique:
"${critiqueAtoC.critique}" (Score: ${critiqueAtoC.score}/100)

Your peer Agent Beta gave you this critique:
"${critiqueBtoC.critique}" (Score: ${critiqueBtoC.score}/100)

Please refine your draft to make it the absolute best, incorporating their feedback where valid. Ensure it remains true to your unique copywriting style.
Output a JSON object with your refined post content and an explanation of the arguments/changes you made.

CRITICAL FORMAT REQUIREMENT:
Output a JSON object with properties 'content', 'score' and 'argument'.
Example:
{
  "content": "Your refined post...",
  "score": 92,
  "argument": "I adjusted the hook because..."
}
`;

    const [refinedA, refinedB, refinedC] = await Promise.all([
      runAgentCall(agentA, "You are refining your original LinkedIn post based on peer critique.", refinePromptA),
      runAgentCall(agentB, "You are refining your original LinkedIn post based on peer critique.", refinePromptB),
      runAgentCall(agentC, "You are refining your original LinkedIn post based on peer critique.", refinePromptC)
    ]);

    // Step 5: Phase 4 (Consensus Settle / Synthesis)
    const consensusPrompt = `
You are the Consensus Settle Panel. We have run a multi-round debate between 3 copywriter agents. Here are their refined drafts:

1. Agent Alpha (${agentA.provider}/${agentA.model}):
Refined Content:
${refinedA.content}
Self-Score: ${refinedA.score}/100
Argument: ${refinedA.argument}

2. Agent Beta (${agentB.provider}/${agentB.model}):
Refined Content:
${refinedB.content}
Self-Score: ${refinedB.score}/100
Argument: ${refinedB.argument}

3. Agent Gamma (${agentC.provider}/${agentC.model}):
Refined Content:
${refinedC.content}
Self-Score: ${refinedC.score}/100
Argument: ${refinedC.argument}

Your task is to analyze these 3 refined options, synthesize their absolute strongest features (e.g. Agent Alpha's pattern-interrupting hook, Agent Beta's value-driven list, Agent Gamma's storytelling arc), and compile the single absolute best LinkedIn post.
Output a JSON object with properties 'content', 'score' (estimated viral likelihood out of 100), and 'synthesisRationale'.

CRITICAL FORMAT REQUIREMENT:
{
  "content": "The finalized absolute best LinkedIn post content...",
  "score": 98,
  "synthesisRationale": "A detailed explanation of how you merged their best parts..."
}
`;

    let finalOutcome;
    try {
      finalOutcome = await runAgentCall(agentA, "You are a Master Synthesizer consolidating drafts into a single ultimate post.", consensusPrompt);
    } catch (e: any) {
      console.error("Synthesis failed, falling back to top scored refined draft:", e);
      const sorted = [
        { name: agentA.name, ...refinedA },
        { name: agentB.name, ...refinedB },
        { name: agentC.name, ...refinedC }
      ].sort((a, b) => b.score - a.score);
      finalOutcome = {
        content: sorted[0].content,
        score: sorted[0].score,
        synthesisRationale: `Consensus synthesis failed (${e.message}). Fell back to the highest scoring refined draft.`
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        trends: liveTrends,
        initialDrafts: [
          { name: agentA.name, content: draftA.content, hookExplanation: draftA.hookExplanation, provider: agentA.provider, model: agentA.model },
          { name: agentB.name, content: draftB.content, hookExplanation: draftB.hookExplanation, provider: agentB.provider, model: agentB.model },
          { name: agentC.name, content: draftC.content, hookExplanation: draftC.hookExplanation, provider: agentC.provider, model: agentC.model },
        ],
        critiques: [
          { from: agentA.name, to: agentB.name, content: critiqueAtoB.critique, score: critiqueAtoB.score },
          { from: agentB.name, to: agentA.name, content: critiqueBtoA.critique, score: critiqueBtoA.score },
          { from: agentB.name, to: agentC.name, content: critiqueBtoC.critique, score: critiqueBtoC.score },
          { from: agentC.name, to: agentB.name, content: critiqueCtoB.critique, score: critiqueCtoB.score },
          { from: agentA.name, to: agentC.name, content: critiqueAtoC.critique, score: critiqueAtoC.score },
          { from: agentC.name, to: agentA.name, content: critiqueCtoA.critique, score: critiqueCtoA.score },
        ],
        refinedDrafts: [
          { name: agentA.name, content: refinedA.content, score: refinedA.score, argument: refinedA.argument, provider: agentA.provider, model: agentA.model },
          { name: agentB.name, content: refinedB.content, score: refinedB.score, argument: refinedB.argument, provider: agentB.provider, model: agentB.model },
          { name: agentC.name, content: refinedC.content, score: refinedC.score, argument: refinedC.argument, provider: agentC.provider, model: agentC.model },
        ],
        best: {
          style: "Settle Consensus Panel",
          content: finalOutcome.content,
          score: finalOutcome.score || 95,
          critique: finalOutcome.synthesisRationale || "Consensus settled successfully."
        }
      }
    });
  } catch (error: any) {
    console.error("Consensus generation error:", error);
    return NextResponse.json(
      { error: error.message || "Consensus generation failed" },
      { status: 500 }
    );
  }
}
