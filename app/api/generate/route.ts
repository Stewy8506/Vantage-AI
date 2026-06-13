import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client (requires process.env.GEMINI_API_KEY)
// Since we might not have the key yet, we initialize inside the route or handle the error gracefully.

export async function POST(req: Request) {
  try {
    const { appName, description, targetAudience, tone } = await req.json();

    if (!appName || !description) {
      return NextResponse.json(
        { error: "App Name and Description are required" },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in environment variables. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    // Step 1: Live Web Search (Mocked for demonstration, or use Tavily if available)
    let trendingInsights = "Recent trends show high engagement with authentic stories, behind-the-scenes struggles, clear metrics (e.g., 'From 0 to 1k MRR in 30 days'), and contrarian takes on industry standards.";
    
    if (process.env.TAVILY_API_KEY) {
      try {
        const tavilyRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `site:linkedin.com/posts trending ${appName} ${targetAudience} insights`,
            search_depth: "basic",
            max_results: 5,
          }),
        });
        const tavilyData = await tavilyRes.json();
        if (tavilyData.results) {
          trendingInsights = tavilyData.results.map((r: { content: string }) => r.content).join("\n");
        }
      } catch (e) {
        console.error("Tavily search failed, using fallback insights", e);
      }
    }

    // Step 2: Construct the Prompt
    const prompt = `
You are a world-class LinkedIn ghostwriter and growth hacker. Your task is to write 3 extremely viral LinkedIn post variants for an app/project.
You must analyze the following trending LinkedIn insights to ensure maximum reach and engagement.

### Context:
- App Name: ${appName}
- Description: ${description}
- Target Audience: ${targetAudience || 'General Professionals'}
- Tone: ${tone || 'Professional yet engaging'}

### Trending LinkedIn Insights (Top 50 analysis proxy):
${trendingInsights}

### Requirements:
1. Generate 3 distinct variants of the post (e.g., Story-driven, Value/Metrics-driven, Contrarian/Hot-take).
2. For each variant, provide the exact post content, a Virality Score out of 100, and a brief critique explaining why it will perform well.
3. Use proper LinkedIn formatting (short paragraphs, hooks, clear CTA).
4. Do NOT use emojis excessively unless it fits the tone.

Respond EXACTLY in this JSON format:
{
  "variants": [
    {
      "id": 1,
      "style": "Story-driven",
      "content": "The actual post content...",
      "score": 95,
      "critique": "Explanation of why this works."
    }
  ]
}
`;

    // Step 3: Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(resultText);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error generating posts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate posts" },
      { status: 500 }
    );
  }
}
