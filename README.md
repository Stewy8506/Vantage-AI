# Virality Mapper - Customizable Multi-Agent Consensus Workspace 🚀

An advanced, highly-customizable multi-agent LinkedIn post generator (inspired by Open WebUI). The application runs multiple writing agent personas concurrently across local and cloud LLMs, evaluates drafts, and uses a consensus Judge agent to synthesize the absolute best possible viral outcome.

## Key Features ✨

- **Multi-Agent Consensus Engine**: Configure 2 or more specialized writing agents to draft posts, and let a Master Judge Agent synthesize the strongest elements (hooks, narrative, metrics) into the ultimate viral post.
- **Dynamic Model Selection**: Connect your credentials and dynamically pull the list of active models directly from the provider.
- **Infinite Agent Customization**: Create, edit, and toggle custom writing agents. Customize their system prompts, temperature values, providers, and models.
- **Diverse LLM Providers**:
  - **Cloud**: Google Gemini, OpenAI, Anthropic
  - **Router**: OpenRouter (Groq, DeepSeek, Together AI, Mistral)
  - **Local**: Ollama and LM Studio (via local developer REST endpoints)
  - **Custom**: Any custom OpenAI-compatible endpoint.
- **In-App Credentials Manager**: Manage API keys and endpoints securely inside the UI (cached in `localStorage`). No keys are saved on a database or backend.
- **Vercel-Inspired Minimalist UI**: Built using a typographic dark theme focusing on precise whitespace, clean typography, thin borders, and structured grids.

## Tech Stack 🛠️

- **Frontend**: Next.js (App Router), React, Vanilla CSS (Geist typographic system)
- **Backend**: Next.js API Routes, dynamic LLM proxy integrations (`@google/genai`, `@anthropic-ai/sdk`, `openai`)

## Getting Started 💻

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd "Virality Mapper"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use the App 🧠

1. **Configure Credentials**: 
   Go to the **Settings** tab in the sidebar and enter your API keys or local base URLs. Use the **Test** button to verify the connection is successful.
2. **Set Personas**: 
   Go to the **Agent Playground** tab to enable or configure individual writing personas (e.g., *Storyteller*, *Analytical*, *Contrarian*). Adjust their system instructions and choose the model you want to load dynamically.
3. **Draft Post**: 
   Go to the **Workspace** tab, select which agents you want to participate, input your project details (name, description, audience, tone), and click **Run Multi-Agent Consensus**.
4. **Deliberate & Copy**: 
   Watch the live consensus loading steps compile. Review the synthesized best outcome and read the Judge's comparison log. Copy the best variant with one click!
