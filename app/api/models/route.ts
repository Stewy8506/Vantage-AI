import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { provider, apiKey, customUrl } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    let models: string[] = [];

    switch (provider) {
      case "gemini":
        if (!apiKey) break;
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          if (res.ok) {
            const data = await res.json();
            models = data.models
              .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
              .map((m: any) => m.name.replace("models/", ""));
          }
        } catch (e) {
          console.error("Failed to fetch Gemini models:", e);
        }
        break;

      case "openai":
        if (!apiKey) break;
        try {
          const res = await fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (res.ok) {
            const data = await res.json();
            models = data.data
              .filter((m: any) => m.id.startsWith("gpt") || m.id.startsWith("o1") || m.id.startsWith("chatgpt"))
              .map((m: any) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch OpenAI models:", e);
        }
        break;

      case "anthropic":
        // Fallback to static model names since Anthropic does not have a public listModels endpoint.
        models = [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307",
        ];
        break;

      case "openrouter":
        if (!apiKey) break;
        try {
          const res = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (res.ok) {
            const data = await res.json();
            models = data.data.map((m: any) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch OpenRouter models:", e);
        }
        break;

      case "ollama":
        const ollamaBase = customUrl || "http://localhost:11434";
        try {
          // Try standard tags endpoint first
          const res = await fetch(`${ollamaBase}/api/tags`);
          if (res.ok) {
            const data = await res.json();
            models = data.models.map((m: any) => m.name);
          } else {
            // Try OpenAI endpoint fallback
            const resV1 = await fetch(`${ollamaBase}/v1/models`);
            if (resV1.ok) {
              const data = await resV1.json();
              models = data.data.map((m: any) => m.id);
            }
          }
        } catch (e) {
          console.error("Failed to fetch Ollama models:", e);
        }
        break;

      case "lmstudio":
        const lmStudioBase = customUrl || "http://localhost:1234";
        try {
          const res = await fetch(`${lmStudioBase}/v1/models`);
          if (res.ok) {
            const data = await res.json();
            models = data.data.map((m: any) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch LM Studio models:", e);
        }
        break;

      case "custom":
        if (!customUrl) break;
        try {
          const headers: HeadersInit = {};
          if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
          }
          const res = await fetch(`${customUrl}/models`, { headers });
          if (res.ok) {
            const data = await res.json();
            models = data.data.map((m: any) => m.id);
          }
        } catch (e) {
          console.error("Failed to fetch Custom models:", e);
        }
        break;

      default:
        break;
    }

    // Default fallbacks in case endpoint request is empty/failed
    if (models.length === 0) {
      if (provider === "gemini") models = ["gemini-2.5-flash", "gemini-2.5-pro"];
      if (provider === "openai") models = ["gpt-4o-mini", "gpt-4o", "o1-mini"];
      if (provider === "openrouter") models = ["meta-llama/llama-3-8b-instruct:free", "google/gemini-flash-1.5-exp"];
    }

    return NextResponse.json({ success: true, models });
  } catch (error: any) {
    console.error("Model fetching route error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch models" }, { status: 500 });
  }
}
