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

export async function POST(req: Request) {
  try {
    const { appName, description, targetAudience, tone, apiKeys, agents, judgeConfig } = await req.json();

    if (!appName || !description) {
      return NextResponse.json(
        { error: "App Name and Description are required" },
        { status: 400 }
      );
    }

    const activeAgents = (agents || []).filter((a: any) => a.enabled);
    if (activeAgents.length < 2) {
      return NextResponse.json(
        { error: "Please enable at least 2 agents in the Agent Playground to run consensus." },
        { status: 400 }
      );
    }

    // Step 1: Live Web Search insights proxy
    const trendingInsights = "Recent trends show high engagement with authentic stories, behind-the-scenes struggles, clear metrics (e.g., 'From 0 to 1k MRR in 30 days'), and contrarian takes on industry standards.";

    // Step 2: Draft Generation Prompt
    const draftUserPrompt = `
Generate a viral LinkedIn post draft for the following project.
Context:
- App Name: ${appName}
- Description: ${description}
- Target Audience: ${targetAudience || 'General Professionals'}
- Tone: ${tone || 'Professional yet engaging'}

LinkedIn Trends:
${trendingInsights}

CRITICAL FORMAT REQUIREMENT:
You must output a JSON object containing the exact properties: "style", "content", "score", and "critique".
Example:
{
  "style": "The specific angle/style used",
  "content": "The post content...",
  "score": 88,
  "critique": "Brief assessment of viral likelihood..."
}
`;

    // Step 3: Call active agents concurrently
    const promises = activeAgents.map(async (agent: any) => {
      try {
        const draft = await callLLM(
          agent.provider,
          agent.model,
          agent.systemPrompt,
          draftUserPrompt,
          agent.temperature,
          apiKeys
        );
        return {
          id: agent.id,
          style: `${agent.name} (${agent.provider}/${agent.model})`,
          content: draft.content || "",
          score: draft.score || 70,
          critique: draft.critique || "Draft completed successfully.",
        };
      } catch (err: any) {
        console.error(`Agent "${agent.name}" failed:`, err);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const validDrafts = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r: any) => r.value);

    if (validDrafts.length < 2) {
      throw new Error(
        `Failed to generate enough drafts. Only ${validDrafts.length} succeeded. Ensure your keys are entered in settings.`
      );
    }

    // Step 4: The Judge Agent Synthesizes the Drafts
    const judgeSystemPrompt =
      judgeConfig?.systemPrompt ||
      `You are an expert LinkedIn copywriter and social media strategist acting as a Master Judge. 
      Analyze the provided drafts, combine their strongest elements (hooks, narrative, metrics, formatting, CTAs), and construct the absolute best LinkedIn post.`;

    const judgeUserPrompt = `
Here are the ${validDrafts.length} drafts generated by our AI agents:

${validDrafts
  .map(
    (d: any, idx: number) =>
      `--- DRAFT ${idx + 1} (${d.style}) ---\nContent:\n${d.content}\n`
  )
  .join("\n")}

Combine and synthesize them into the absolute best possible outcome.

CRITICAL FORMAT REQUIREMENT:
You must output a JSON object containing the exact properties: "style", "content", "score", and "critique".
Example:
{
  "style": "Synthesized Best Outcome",
  "content": "The finalized best combined post content...",
  "score": 98,
  "critique": "A detailed explanation of how this version synthesizes the best parts of the drafts, and why it is superior."
}
`;

    const jProvider = judgeConfig?.provider || "gemini";
    const jModel = judgeConfig?.model || "gemini-2.5-flash";
    const jTemp = judgeConfig?.temperature ?? 0.5;

    let bestOutcome;
    try {
      bestOutcome = await callLLM(
        jProvider,
        jModel,
        judgeSystemPrompt,
        judgeUserPrompt,
        jTemp,
        apiKeys
      );
      bestOutcome.style = `Synthesized Best (${jProvider}/${jModel})`;
    } catch (e: any) {
      console.error("Judge synthesis failed, falling back to top scored draft:", e);
      bestOutcome = [...validDrafts].sort((a, b) => b.score - a.score)[0];
      bestOutcome.style = "Highest Scored Draft (Synthesis Failed)";
      bestOutcome.critique = `Synthesis failed due to API error (${e.message}). Falling back to the highest scoring draft.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        best: bestOutcome,
        drafts: validDrafts,
      },
    });
  } catch (error: any) {
    console.error("Consensus generation error:", error);
    return NextResponse.json(
      { error: error.message || "Consensus generation failed" },
      { status: 500 }
    );
  }
}
