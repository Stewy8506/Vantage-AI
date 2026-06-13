# Virality Mapper - Viral LinkedIn Post Generator 🚀

An AI-powered web application that analyzes real-time trending LinkedIn posts and generates highly-optimized, viral content variants tailored to your app or project.

## Features ✨

- **Real-time Trend Analysis**: Integrates with Web Search APIs (like Tavily) to pull the top trending LinkedIn posts within your specific niche.
- **AI-Powered Generation**: Uses Google's Gemini 2.5 Flash model to craft 3 distinct post variants based on current viral frameworks.
- **Scoring & Critiques**: Every generated post comes with a "Virality Score" and an AI critique explaining *why* the post works and how it leverages the target audience's psychology.
- **Premium UI/UX**: Built with a stunning dark theme featuring glassmorphism, fluid micro-animations, and vibrant gradients.
- **One-Click Copy**: Easily copy your favorite variant straight to your clipboard to post.

## Tech Stack 🛠️

- **Frontend**: Next.js (App Router), React, Vanilla CSS (Custom Design System), Lucide React (Icons)
- **Backend**: Next.js API Routes
- **AI Model**: Google Gemini API (`@google/genai`)
- **Search API**: Tavily Search API (optional, defaults to mocked trends for demo)

## Getting Started 💻

### Prerequisites
- Node.js (v18 or higher)
- npm
- Google Gemini API Key
- Tavily API Key (Optional)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd "Virality Mapper"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root of the project and add your API keys:
   ```env
   # Required: Get this from Google AI Studio
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Get this from Tavily for live search trends. 
   # If left out, the app will use mocked trend data for demonstrations.
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works 🧠

1. **Input Details**: Enter your app name, description, target audience, and desired tone (e.g., "Storytelling", "Provocative", "Data-driven").
2. **Analysis**: The backend searches for top trending LinkedIn posts related to your niche to extract working frameworks.
3. **Generation**: The context and trends are fed into the Gemini LLM with a specialized prompt to generate 3 unique variants.
4. **Publish**: Review the virality scores, read the critiques, copy the best one, and post it to LinkedIn!
