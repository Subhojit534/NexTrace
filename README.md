# 🛡️ NexTrace Frontend (React + Vite + Tailwind CSS)

Google Gemini-inspired conversational interface for the NexTrace Autonomous Cloud Security Investigator.

## Features
- **Google Gemini Interface**: Clean centered conversational flow, prompt pills, and floating bottom input bar with attachment `+` button.
- **Interactive JSON Graph Import**: Import any architecture `.json` file with instant validation, node/relationship badges, and context-aware scenario pills.
- **Cyber Kill-Chain & Path Proofs**: Renders 5-stage horizontal kill-chain cards, explainable `shortestPath()` node sequence proofs, and blast-radius impact metrics.
- **FalkorDB & LLM Settings**: Secure drawer to input your own FalkorDB cluster host/port/password and Groq, Gemini, or OpenAI API keys (saved in browser `localStorage`).
- **Google OAuth via Supabase**: Full Google authentication with graceful guest demo mode fallback.
- **Downloadable Topologies**: One-click download of all 5 demo benchmarks from `public/samples/`.

## Deploy to Vercel
1. Create a GitHub repository with the contents of this `frontend/` folder.
2. In Vercel Dashboard, click **Add New Project** and select this repo.
3. Configure Environment Variables:
   - `VITE_API_BASE_URL`: Deployed backend URL (e.g., `https://your-backend.vercel.app`)
   - `VITE_SUPABASE_URL`: (Optional) Supabase project URL for Google OAuth
   - `VITE_SUPABASE_ANON_KEY`: (Optional) Supabase anon key
4. Click **Deploy**.

## Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
